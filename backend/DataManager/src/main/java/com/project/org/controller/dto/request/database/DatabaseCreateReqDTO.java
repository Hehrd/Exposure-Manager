package com.project.org.controller.dto.request.database;

import com.project.org.controller.dto.request.ReqDTO;
import lombok.Data;

@Data
public class DatabaseCreateReqDTO implements ReqDTO {
    private String name;
}
