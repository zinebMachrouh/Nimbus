package com.example.backend.security.services;

import com.example.backend.entities.user.User;
import com.example.backend.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Slf4j
@Service
public class UserDetailsServiceImpl implements UserDetailsService {
    @Autowired
    UserRepository userRepository;

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        log.debug("Loading user by username: {}", username);
        
        // Ensure username is trimmed to remove whitespace issues
        final String trimmedUsername = username.trim();
        log.debug("Trimmed username for lookup: '{}' (length: {})", trimmedUsername, trimmedUsername.length());
        
        // First try exact match
        Optional<User> userOpt = userRepository.findByUsernameForAuthentication(trimmedUsername);
        
        if (userOpt.isEmpty()) {
            log.info("User not found with exact username match, trying case-insensitive search: {}", trimmedUsername);
            
            // Try a case-insensitive search
            userOpt = userRepository.findByUsernameIgnoreCaseForAuthentication(trimmedUsername);
            
            if (userOpt.isEmpty()) {
                log.error("User still not found after case-insensitive search");
                throw new UsernameNotFoundException("User Not Found with username: " + trimmedUsername);
            } else {
                log.info("User found with case-insensitive search: {} (original input: {})", 
                         userOpt.get().getUsername(), trimmedUsername);
            }
        }
        
        User user = userOpt.get();
        
        if (!user.isActive()) {
            log.error("User account is not active: {}", trimmedUsername);
            throw new UsernameNotFoundException("User account is not active: " + trimmedUsername);
        }
        
        UserDetails userDetails = UserDetailsImpl.build(user);
        log.debug("Built UserDetailsImpl for user: {}", user.getUsername());
        
        return userDetails;
    }
}

