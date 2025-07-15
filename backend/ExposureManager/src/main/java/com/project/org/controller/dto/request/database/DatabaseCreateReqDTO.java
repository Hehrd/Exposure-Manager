package com.project.org.controller.dto.request.database;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class DatabaseCreateReqDTO {
    @NotBlank
    String name;
}
