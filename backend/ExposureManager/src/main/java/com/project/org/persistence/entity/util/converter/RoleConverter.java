package com.project.org.persistence.entity.util.converter;

import com.project.org.persistence.entity.enums.Role;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter
public class RoleConverter implements AttributeConverter<Role, String> {

    @Override
    public String convertToDatabaseColumn(Role role) {
        return role == null ? null : role.toString();
    }

    @Override
    public Role convertToEntityAttribute(String text) {
        return Role.getRoleByText(text);
    }
}
