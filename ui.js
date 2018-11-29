class LayoutVertical {
  constructor(padding) {
    this.children = [];
    this.padding = padding;
  }

  add(panel) {
    this.children.push(panel);
    return this;
  }

  draw() {
    push();

    translate(0, this.padding);

    for (let child of this.children) {
      // Draw the child
      child.draw(this.padding);

      // Move down by height + padding
      translate(0, child.height + this.padding);
    }

    pop();
  }
}

class Panel {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  add(child) {
    this.children.push(child);
    return this;
  }

  draw() {
    console.log("Implement This");
  }
}

class Title extends Panel {
  constructor(title, x, y, width, height) {
    super(x, y, width, height);
    this.title = title;
  }

  draw(padding, width, height) {
    push();
    translate(padding, padding);
    fill(255)
      .strokeWeight(0)
      .textSize(16)
      .textFont("Helvetica", 24);
    text(this.title, 0, 24);
    pop();
  }
}

class DrawArea extends Panel {
  draw(padding) {
    push();
    translate(padding, padding);
    fill(0);
    rect(0, 0, this.width, this.height);
    pop();
  }
}

class Preditions {
  constructor({ distribution = [], prediction = null }) {
    this.distribution = distribution;
    this.prediction = prediction;
    this.maxheight = 100;
    this.width = 20;
    this.gap = 20;
  }

  draw() {
    const norm = x => map(x, 0, 1, 0, this.maxheight);

    for (let i of [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]) {
      let height = norm(this.distribution[i]);
      let x = (i + 1) * (this.width + this.gap);

      if (i == this.prediction) {
        fill("red");
        stroke("red");
      } else {
        fill(255);
        stroke(255);
      }

      // Labels
      push();
      strokeWeight(0);
      textSize(12);
      textFont("Courier", 16);
      text(i, x - 5, 120);
      pop();

      // Lines
      push();
      strokeWeight(20);
      strokeCap(SQUARE);
      line(x, 100, x, 100 - height);
      pop();
    }
  }
}
