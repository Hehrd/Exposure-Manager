package com.project.org.controller.dto.request.database;

import lombok.Data;

@Data
public class DatabaseRenameReqDTO {
    private String oldName;
    private String newName;
}
