package com.nimbus.service.impl;

import com.nimbus.dto.MessageDTO;
import com.nimbus.dto.UserDTO;
import com.nimbus.dto.request.SendMessageRequest;
import com.nimbus.exception.ResourceNotFoundException;
import com.nimbus.exception.UnauthorizedException;
import com.nimbus.mapper.MessageMapper;
import com.nimbus.mapper.UserMapper;
import com.nimbus.model.Message;
import com.nimbus.model.User;
import com.nimbus.repository.MessageRepository;
import com.nimbus.repository.UserRepository;
import com.nimbus.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class MessageServiceImpl implements MessageService {
    
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final MessageMapper messageMapper;
    private final UserMapper userMapper;
    private final SimpMessagingTemplate messagingTemplate;
    
    @Override
    public List<UserDTO> getConversations(Long userId) {
        User currentUser = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        // Get all messages where the current user is either the sender or recipient
        List<Message> messages = messageRepository.findBySenderOrRecipientOrderByCreatedAtDesc(currentUser, currentUser);
        
        // Extract unique conversation partners
        List<User> conversationPartners = messages.stream()
                .map(m -> m.getSender().getId().equals(currentUser.getId()) ? m.getRecipient() : m.getSender())
                .distinct()
                .collect(Collectors.toList());
        
        return conversationPartners.stream()
                .map(userMapper::toDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional
    public List<MessageDTO> getConversation(Long userId, Long otherUserId) {
        User currentUser = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        User otherUser = userRepository.findById(otherUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + otherUserId));
        
        // Get all messages between the current user and the other user
        List<Message> sentMessages = messageRepository.findBySenderAndRecipientOrderByCreatedAtDesc(currentUser, otherUser);
        List<Message> receivedMessages = messageRepository.findBySenderAndRecipientOrderByCreatedAtDesc(otherUser, currentUser);
        
        // Combine and sort messages by timestamp
        List<Message> allMessages = Stream.concat(sentMessages.stream(), receivedMessages.stream())
                .sorted(Comparator.comparing(Message::getCreatedAt))
                .collect(Collectors.toList());
        
        // Mark received messages as read
        receivedMessages.stream()
                .filter(m -> !m.isRead())
                .forEach(m -> {
                    m.setRead(true);
                    messageRepository.save(m);
                });
        
        return allMessages.stream()
                .map(messageMapper::toDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional
    public MessageDTO sendMessage(Long senderId, SendMessageRequest sendMessageRequest) {
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + senderId));
        
        User recipient = userRepository.findById(sendMessageRequest.getRecipientId())
                .orElseThrow(() -> new ResourceNotFoundException("Recipient not found with id: " + sendMessageRequest.getRecipientId()));
        
        Message message = new Message();
        message.setSender(sender);
        message.setRecipient(recipient);
        message.setContent(sendMessageRequest.getContent());
        message.setRead(false);
        
        Message savedMessage = messageRepository.save(message);
        
        // Notify the recipient about the new message
        MessageDTO messageDTO = messageMapper.toDTO(savedMessage);
        messagingTemplate.convertAndSend("/queue/user/" + recipient.getId() + "/messages", messageDTO);
        
        return messageDTO;
    }
    
    @Override
    public List<MessageDTO> getUnreadMessages(Long userId) {
        User currentUser = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        List<Message> unreadMessages = messageRepository.findByRecipientAndReadOrderByCreatedAtDesc(currentUser, false);
        
        return unreadMessages.stream()
                .map(messageMapper::toDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional
    public MessageDTO markAsRead(Long userId, Long messageId) {
        User currentUser = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new ResourceNotFoundException("Message not found with id: " + messageId));
        
        // Verify that the current user is the recipient
        if (!message.getRecipient().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("You are not authorized to mark this message as read");
        }
        
        message.setRead(true);
        Message updatedMessage = messageRepository.save(message);
        
        return messageMapper.toDTO(updatedMessage);
    }
}

