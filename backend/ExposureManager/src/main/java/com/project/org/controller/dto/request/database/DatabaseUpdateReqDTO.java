package com.project.org.controller.dto.request.database;

import lombok.Data;

@Data
public class DatabaseUpdateReqDTO {
    private String oldName;
    private String newName;
}
