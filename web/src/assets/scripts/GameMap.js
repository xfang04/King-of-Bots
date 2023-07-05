import { AcGameObject } from "./AcGameObject";
import { Wall } from "./Wall";
import { Snake } from "./Snake";

export class GameMap extends AcGameObject {
  constructor(ctx, parent, store) {
    super();

    this.ctx = ctx;
    this.parent = parent;
    this.store = store;
    // L: 每个小正方形的边长，由浏览器窗口大小决定
    this.L = 0;
    // 当行宽相等时，可能出现两条蛇同一时间进入同一格子的情况
    // 为了避免这种情况，行数和列数最好为一奇一偶
    this.rows = 13;
    this.cols = 14;

    this.inner_walls_count = 20;
    this.walls = [];

    this.snakes = [
      new Snake({ id: 0, color: "#4876EC", r: this.rows - 2, c: 1 }, this),
      new Snake({ id: 1, color: "#F94848", r: 1, c: this.cols - 2 }, this),
    ];
  }

  create_walls() {
    const g = this.store.state.pk.gamemap;

    // 根据二维布尔数组，把障碍物加入到this.walls数组中
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (g[r][c]) {
          this.walls.push(new Wall(r, c, this));
        }
      }
    }
  }

  add_listening_events() {
    this.ctx.canvas.focus();

    this.ctx.canvas.addEventListener("keydown", (e) => {
      let d = -1;
      if (e.key === "w") d = 0;
      else if (e.key === "d") d = 1;
      else if (e.key === "s") d = 2;
      else if (e.key === "a") d = 3;

      if (d >= 0) {
        this.store.state.pk.socket.send(
          JSON.stringify({
            event: "move",
            direction: d,
          })
        );
      }
    });
  }

  start() {
    this.create_walls();

    this.add_listening_events();
  }

  update_size() {
    // parent的宽高由浏览器的窗口大小决定，所以每次更新时都要重新计算
    // 每个小正方形的边长，在宽高中取最小值
    // 因为canvas是按照整数坐标画正方形，为了避免边界出现空隙，所以要取整
    this.L = parseInt(
      Math.min(
        this.parent.clientWidth / this.cols,
        this.parent.clientHeight / this.rows
      )
    );
    // 由小正方形的边长计算画布的宽高
    this.ctx.canvas.width = this.L * this.cols;
    this.ctx.canvas.height = this.L * this.rows;
  }

  check_ready() {
    // 判断两条蛇是否都准备好下一回合了
    for (const snake of this.snakes) {
      if (snake.status !== "idle") return false;
      if (snake.direction === -1) return false;
    }
    return true;
  }

  next_step() {
    // 让两条蛇进入下一回合
    for (const snake of this.snakes) {
      snake.next_step();
    }
  }

  check_valid(cell) {
    // 检测目标位置是否合法：没有撞到两条蛇的身体和障碍物
    for (const wall of this.walls) {
      if (wall.r === cell.r && wall.c === cell.c) return false;
    }

    for (const snake of this.snakes) {
      let k = snake.cells.length;
      if (!snake.check_tail_increasing()) {
        // 当蛇尾会前进的时候，蛇尾不要判断
        k--;
      }
      for (let i = 0; i < k; i++) {
        if (snake.cells[i].r === cell.r && snake.cells[i].c === cell.c)
          return false;
      }
    }

    return true;
  }

  update() {
    this.update_size();
    if (this.check_ready()) {
      this.next_step();
    }
    this.render();
  }

  render() {
    const color_even = "#AAD751",
      color_odd = "#A2D149";
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        // 奇偶格子颜色不同
        if ((r + c) % 2 == 0) {
          this.ctx.fillStyle = color_even;
        } else {
          this.ctx.fillStyle = color_odd;
        }
        // canvas画矩形，横着为x，竖着为y
        this.ctx.fillRect(c * this.L, r * this.L, this.L, this.L);
      }
    }
  }
}
