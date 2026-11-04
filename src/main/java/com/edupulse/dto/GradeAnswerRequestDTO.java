package com.edupulse.dto;

import jakarta.validation.constraints.NotBlank;

public class GradeAnswerRequestDTO {

    @NotBlank(message = "Question text is required.")
    private String question;

    @NotBlank(message = "Student answer is required.")
    private String studentAnswer;

    private String subject;
    private Integer maxMarks; // Default 10 or 2
    private String scoringRubric; // Optional rubric context
    private String modelAnswer;   // Optional model answer

    public GradeAnswerRequestDTO() {
    }

    public GradeAnswerRequestDTO(String question, String studentAnswer, String subject, Integer maxMarks, String scoringRubric, String modelAnswer) {
        this.question = question;
        this.studentAnswer = studentAnswer;
        this.subject = subject;
        this.maxMarks = maxMarks;
        this.scoringRubric = scoringRubric;
        this.modelAnswer = modelAnswer;
    }

    public String getQuestion() {
        return question;
    }

    public void setQuestion(String question) {
        this.question = question;
    }

    public String getStudentAnswer() {
        return studentAnswer;
    }

    public void setStudentAnswer(String studentAnswer) {
        this.studentAnswer = studentAnswer;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public Integer getMaxMarks() {
        return maxMarks != null && maxMarks > 0 ? maxMarks : 10;
    }

    public void setMaxMarks(Integer maxMarks) {
        this.maxMarks = maxMarks;
    }

    public String getScoringRubric() {
        return scoringRubric;
    }

    public void setScoringRubric(String scoringRubric) {
        this.scoringRubric = scoringRubric;
    }

    public String getModelAnswer() {
        return modelAnswer;
    }

    public void setModelAnswer(String modelAnswer) {
        this.modelAnswer = modelAnswer;
    }
}
