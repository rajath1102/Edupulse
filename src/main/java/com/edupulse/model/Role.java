package com.edupulse.model;

/**
 * Enumeration of User Roles in EduPulse.
 * Pre-fixed with 'ROLE_' to conform to standard Spring Security authority conventions.
 */
public enum Role {
    ROLE_STUDENT,
    ROLE_TEACHER,
    ROLE_ADMIN
}
