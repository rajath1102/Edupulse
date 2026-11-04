package com.edupulse.dto;

import java.util.List;

public class GradeAnswerResponseDTO {

    private int scoreAwarded;
    private int maxMarks;
    private double percentage;
    private String gradeBand; // "EXCELLENT", "GOOD", "NEEDS_IMPROVEMENT", "UNSATISFACTORY"
    private String feedbackSummary;
    private List<String> strengths;
    private List<String> missedPoints;
    private String modelImprovementTip;
    private String aiSource;

    public GradeAnswerResponseDTO() {
    }

    public GradeAnswerResponseDTO(int scoreAwarded, int maxMarks, double percentage, String gradeBand,
                                  String feedbackSummary, List<String> strengths, List<String> missedPoints,
                                  String modelImprovementTip, String aiSource) {
        this.scoreAwarded = scoreAwarded;
        this.maxMarks = maxMarks;
        this.percentage = percentage;
        this.gradeBand = gradeBand;
        this.feedbackSummary = feedbackSummary;
        this.strengths = strengths;
        this.missedPoints = missedPoints;
        this.modelImprovementTip = modelImprovementTip;
        this.aiSource = aiSource;
    }

    public int getScoreAwarded() {
        return scoreAwarded;
    }

    public void setScoreAwarded(int scoreAwarded) {
        this.scoreAwarded = scoreAwarded;
    }

    public int getMaxMarks() {
        return maxMarks;
    }

    public void setMaxMarks(int maxMarks) {
        this.maxMarks = maxMarks;
    }

    public double getPercentage() {
        return percentage;
    }

    public void setPercentage(double percentage) {
        this.percentage = percentage;
    }

    public String getGradeBand() {
        return gradeBand;
    }

    public void setGradeBand(String gradeBand) {
        this.gradeBand = gradeBand;
    }

    public String getFeedbackSummary() {
        return feedbackSummary;
    }

    public void setFeedbackSummary(String feedbackSummary) {
        this.feedbackSummary = feedbackSummary;
    }

    public List<String> getStrengths() {
        return strengths;
    }

    public void setStrengths(List<String> strengths) {
        this.strengths = strengths;
    }

    public List<String> getMissedPoints() {
        return missedPoints;
    }

    public void setMissedPoints(List<String> missedPoints) {
        this.missedPoints = missedPoints;
    }

    public String getModelImprovementTip() {
        return modelImprovementTip;
    }

    public void setModelImprovementTip(String modelImprovementTip) {
        this.modelImprovementTip = modelImprovementTip;
    }

    public String getAiSource() {
        return aiSource;
    }

    public void setAiSource(String aiSource) {
        this.aiSource = aiSource;
    }
}
