package com.project.org.persistence.entity.util.converter;

import com.project.org.persistence.entity.enums.Roles;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter
public class RoleConverter implements AttributeConverter<Roles, String> {

    @Override
    public String convertToDatabaseColumn(Roles role) {
        return role == null ? null : role.toString();
    }

    @Override
    public Roles convertToEntityAttribute(String text) {
        return Roles.getRoleByText(text);
    }
}
