package com.project.org.persistence.entity.enums;

public enum JobStatus {
    FINISHED,
    IN_PROGRESS,
    FAILED;

    public static JobStatus getJobStatusByText(String text) {
        for (JobStatus jobStatus : JobStatus.values()) {
            if (jobStatus.toString().equalsIgnoreCase(text)) {
                return jobStatus;
            }
        }
        return null;
    }
}
