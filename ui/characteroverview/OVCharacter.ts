namespace characteroverview {

    import DataComponent = core.DataComponent;
    import Component = core.Component;

    export class OVCharacter extends DataComponent {

        private baseStyle = "co-OVCharacter";
        
        protected render(): void {
            this.addStyle(this.baseStyle);

            const header = new Component();
            header.addStyle(this.baseStyle + "_Header");
            this.appendChild(header);

            const image = new Component();
            image.addStyle(this.baseStyle + "_Image");
            image.getElement().setAttribute("style", `background-image:url("${this.model.data["img"]}")`)
            header.appendChild(image);

            const detailsWrapper = new Component();
            detailsWrapper.addStyle(this.baseStyle + "_Details");
            header.appendChild(detailsWrapper);

            const name = new Component();
            name.addStyle(this.baseStyle + "_Name");
            name.setText(this.model.data["name"] + " " + this.model.data["secondname"] || "");
            detailsWrapper.appendChild(name);

            const classDetails = new Component();
            classDetails.addStyle(this.baseStyle + "_ClassDetails");
            detailsWrapper.appendChild(classDetails);

            const level = new Component();
            level.addStyle(this.baseStyle + "_Level");
            level.setText(`Level ${this.model.data["level"]}`);
            classDetails.appendChild(level);

            const classDetailsDivider = new Component();
            classDetailsDivider.addStyle(this.baseStyle + "_ClassDetailsDivider");
            classDetailsDivider.setText("|");
            classDetails.appendChild(classDetailsDivider);
            
            const race = new Component();
            race.addStyle(this.baseStyle + "_Race");
            race.setText(this.model.data["race"]);
            classDetails.appendChild(race);

            const classDescription = new Component();
            classDescription.addStyle(this.baseStyle + "_ClassDescription");
            classDescription.setText(this.model.data["class"]);
            detailsWrapper.appendChild(classDescription);

            const health = new Component();
            health.addStyle(this.baseStyle + "_Health");
            header.appendChild(health);

            const healthValue = new Component();
            healthValue.addStyle(this.baseStyle + "_HealthValue");
            healthValue.setText(this.model.data["maxhp"]);
            health.appendChild(healthValue);

            const healthLabel = new Component();
            healthLabel.addStyle(this.baseStyle + "_HealthLabel");
            healthLabel.setText("Max HP");
            health.appendChild(healthLabel);

            const passiveStats = new StatsContainer(this.model, 0, 5);
            passiveStats.addStyle(this.baseStyle + "_Passive");
            this.appendChild(passiveStats);

            const attributes = new StatsContainer(this.model, 5, this.model.getChildren().length);
            attributes.addStyle(this.baseStyle + "_Attributes");
            this.appendChild(attributes);
        }

    }
}