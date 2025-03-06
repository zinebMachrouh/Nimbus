package com.nimbus.mapper;

import com.nimbus.dto.MessageDTO;
import com.nimbus.model.Message;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class MessageMapper {
    
    private final UserMapper userMapper;
    
    public MessageDTO toDTO(Message message) {
        if (message == null) {
            return null;
        }
        
        MessageDTO dto = new MessageDTO();
        dto.setId(message.getId());
        dto.setSender(userMapper.toDTO(message.getSender()));
        dto.setRecipient(userMapper.toDTO(message.getRecipient()));
        dto.setContent(message.getContent());
        dto.setRead(message.isRead());
        dto.setCreatedAt(message.getCreatedAt());
        
        return dto;
    }
}

