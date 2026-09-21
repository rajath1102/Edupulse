package com.edupulse.exception;

/**
 * Exception thrown when a requested resource (like Student or Performance) is not found.
 */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }
}

