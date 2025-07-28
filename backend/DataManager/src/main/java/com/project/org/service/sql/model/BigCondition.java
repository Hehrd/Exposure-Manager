package com.project.org.service.sql.model;


import lombok.Data;

import java.util.List;

public class BigCondition {
    private List<SmallCondition> conditions;
    private List<LogicalOperators> logicalOperators;

    @Override
    public String toString() {
        StringBuffer sb = new StringBuffer();
        sb.append("(");
        for (int i = 0; i < logicalOperators.size(); i++) {
            sb.append(conditions.get(i).toString());
            sb.append(logicalOperators.get(i).getValue());
        }
        sb.append(conditions.getLast().toString());
        sb.append(")");
        return sb.toString();
    }

}
