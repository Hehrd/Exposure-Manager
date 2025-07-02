package com.project.org.persistence.entity.enums;

public enum Roles {
    ADMIN,
    MODERATOR,
    USER;


    public static Roles getRoleByText(String text) {
        for (Roles role : Roles.values()) {
            if (role.toString().equalsIgnoreCase(text)) {
                return role;
            }
        }
        return null;
    }
}
