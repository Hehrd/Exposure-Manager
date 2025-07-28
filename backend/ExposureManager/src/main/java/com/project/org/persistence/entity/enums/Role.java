package com.project.org.persistence.entity.enums;

public enum Role {
    ADMIN,
    MODERATOR,
    USER;


    public static Role getRoleByText(String text) {
        for (Role role : Role.values()) {
            if (role.toString().equalsIgnoreCase(text)) {
                return role;
            }
        }
        return null;
    }
}
