package com.project.org.controller.dto.request.database;

import com.project.org.controller.dto.request.ReqDTO;
import lombok.Data;

@Data
public class DatabaseRenameReqDTO implements ReqDTO {
    private String oldName;
    private String newName;
}
