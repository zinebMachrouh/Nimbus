package com.example.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class ResourceExhaustedException extends RuntimeException {
    public ResourceExhaustedException(String message) {
        super(message);
    }

    public ResourceExhaustedException(String message, Throwable cause) {
        super(message, cause);
    }

    public ResourceExhaustedException(String resource, String limit) {
        super(String.format("%s has reached its limit: %s", resource, limit));
    }
} 