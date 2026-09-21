package com.edupulse.exception;

/**
 * Exception thrown when a client request violates business logic or validation rules.
 */
public class BadRequestException extends RuntimeException {

    public BadRequestException(String message) {
        super(message);
    }
}

