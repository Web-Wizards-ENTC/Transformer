package com.webwizards.transformerApp.model;

import jakarta.persistence.*;

@Entity
@Table(name = "maintenance_records")
public class MaintenanceRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "inspection_id", nullable = false, unique = true)
    private Inspection inspection;

    private String startTime;
    private String completionTime;
    private String supervisedBy;

    private String techI;
    private String techII;
    private String techIII;
    private String helpers;

    private String inspectedBy;
    private String inspectedDate;

    private String rectifiedBy;
    private String rectifiedDate;

    private String reInspectedBy;
    private String reInspectedDate;

    private String css;
    private String cssDate;

    private Boolean allSpotsCorrect;
    private String css2;
    private String css2Date;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Inspection getInspection() { return inspection; }
    public void setInspection(Inspection inspection) { this.inspection = inspection; }

    public String getStartTime() { return startTime; }
    public void setStartTime(String startTime) { this.startTime = startTime; }

    public String getCompletionTime() { return completionTime; }
    public void setCompletionTime(String completionTime) { this.completionTime = completionTime; }

    public String getSupervisedBy() { return supervisedBy; }
    public void setSupervisedBy(String supervisedBy) { this.supervisedBy = supervisedBy; }

    public String getTechI() { return techI; }
    public void setTechI(String techI) { this.techI = techI; }

    public String getTechII() { return techII; }
    public void setTechII(String techII) { this.techII = techII; }

    public String getTechIII() { return techIII; }
    public void setTechIII(String techIII) { this.techIII = techIII; }

    public String getHelpers() { return helpers; }
    public void setHelpers(String helpers) { this.helpers = helpers; }

    public String getInspectedBy() { return inspectedBy; }
    public void setInspectedBy(String inspectedBy) { this.inspectedBy = inspectedBy; }

    public String getInspectedDate() { return inspectedDate; }
    public void setInspectedDate(String inspectedDate) { this.inspectedDate = inspectedDate; }

    public String getRectifiedBy() { return rectifiedBy; }
    public void setRectifiedBy(String rectifiedBy) { this.rectifiedBy = rectifiedBy; }

    public String getRectifiedDate() { return rectifiedDate; }
    public void setRectifiedDate(String rectifiedDate) { this.rectifiedDate = rectifiedDate; }

    public String getReInspectedBy() { return reInspectedBy; }
    public void setReInspectedBy(String reInspectedBy) { this.reInspectedBy = reInspectedBy; }

    public String getReInspectedDate() { return reInspectedDate; }
    public void setReInspectedDate(String reInspectedDate) { this.reInspectedDate = reInspectedDate; }

    public String getCss() { return css; }
    public void setCss(String css) { this.css = css; }

    public String getCssDate() { return cssDate; }
    public void setCssDate(String cssDate) { this.cssDate = cssDate; }

    public Boolean getAllSpotsCorrect() { return allSpotsCorrect; }
    public void setAllSpotsCorrect(Boolean allSpotsCorrect) { this.allSpotsCorrect = allSpotsCorrect; }

    public String getCss2() { return css2; }
    public void setCss2(String css2) { this.css2 = css2; }

    public String getCss2Date() { return css2Date; }
    public void setCss2Date(String css2Date) { this.css2Date = css2Date; }
}
