package com.nimbus.service;

import com.nimbus.dto.MessageDTO;
import com.nimbus.dto.UserDTO;
import com.nimbus.dto.request.SendMessageRequest;

import java.util.List;

public interface MessageService {
    List<UserDTO> getConversations(Long userId);
    List<MessageDTO> getConversation(Long userId, Long otherUserId);
    MessageDTO sendMessage(Long senderId, SendMessageRequest sendMessageRequest);
    List<MessageDTO> getUnreadMessages(Long userId);
    MessageDTO markAsRead(Long userId, Long messageId);
}

