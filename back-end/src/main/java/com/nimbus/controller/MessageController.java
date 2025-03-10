package com.nimbus.controller;

import com.nimbus.dto.MessageDTO;
import com.nimbus.dto.UserDTO;
import com.nimbus.dto.request.SendMessageRequest;
import com.nimbus.service.MessageService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/messages")
public class MessageController {
    
    @Autowired
    private MessageService messageService;
    
    @GetMapping("/conversations/{userId}")
    @PreAuthorize("@userSecurity.isCurrentUser(#userId, authentication)")
    public ResponseEntity<List<UserDTO>> getConversations(@PathVariable Long userId) {
        List<UserDTO> conversations = messageService.getConversations(userId);
        return ResponseEntity.ok(conversations);
    }
    
    @GetMapping("/{userId}/conversation/{otherUserId}")
    @PreAuthorize("@userSecurity.isCurrentUser(#userId, authentication)")
    public ResponseEntity<List<MessageDTO>> getConversation(
            @PathVariable Long userId,
            @PathVariable Long otherUserId) {
        List<MessageDTO> messages = messageService.getConversation(userId, otherUserId);
        return ResponseEntity.ok(messages);
    }
    
    @PostMapping("/{senderId}/send")
    @PreAuthorize("@userSecurity.isCurrentUser(#senderId, authentication)")
    public ResponseEntity<MessageDTO> sendMessage(
            @PathVariable Long senderId,
            @Valid @RequestBody SendMessageRequest sendMessageRequest) {
        MessageDTO message = messageService.sendMessage(senderId, sendMessageRequest);
        return ResponseEntity.ok(message);
    }
    
    @GetMapping("/{userId}/unread")
    @PreAuthorize("@userSecurity.isCurrentUser(#userId, authentication)")
    public ResponseEntity<List<MessageDTO>> getUnreadMessages(@PathVariable Long userId) {
        List<MessageDTO> unreadMessages = messageService.getUnreadMessages(userId);
        return ResponseEntity.ok(unreadMessages);
    }
    
    @PutMapping("/{userId}/read/{messageId}")
    @PreAuthorize("@userSecurity.isCurrentUser(#userId, authentication)")
    public ResponseEntity<MessageDTO> markAsRead(
            @PathVariable Long userId,
            @PathVariable Long messageId) {
        MessageDTO message = messageService.markAsRead(userId, messageId);
        return ResponseEntity.ok(message);
    }
}

