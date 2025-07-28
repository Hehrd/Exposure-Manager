package com.project.org.service.sql.model;

import lombok.Data;

@Data
public class Join {
    private String mainTable;
    private String joinTable;
    private BigCondition condition;

    @Override
    public String toString() {
        StringBuffer sb = new StringBuffer();
        sb.append("JOIN ");
        sb.append(mainTable);
        sb.append(" ON ");
        sb.append(condition.toString());
        return sb.toString();
    }
}
