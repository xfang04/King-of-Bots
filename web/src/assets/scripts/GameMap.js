import { AcGameObject } from "./AcGameObject";
import { Wall } from "./Wall";
import { Snake } from "./Snake";

export class GameMap extends AcGameObject {
  constructor(ctx, parent) {
    super();

    this.ctx = ctx;
    this.parent = parent;
    // L: 每个小正方形的边长，由浏览器窗口大小决定
    this.L = 0;
    // 当行宽相等时，可能出现两条蛇同一时间进入同一格子的情况
    // 为了避免这种情况，行数和列数最好为一奇一偶
    this.rows = 13;
    this.cols = 14;

    this.inner_walls_count = 20;
    this.walls = [];

    this.snakes = [
      new Snake(
        {
          id: 0,
          color: "#4876EC",
          r: this.rows - 2,
          c: 1,
        },
        this
      ),
      new Snake(
        {
          id: 1,
          color: "#F94848",
          r: 1,
          c: this.cols - 2,
        },
        this
      ),
    ];
  }

  check_connectivity(g, sx, sy, tx, ty) {
    // flood fill算法，检查从(sx, sy)到(tx, ty)是否连通
    // 如果走到了(tx, ty)，返回true
    if (sx == tx && sy == ty) return true;
    // 将当前(sx, sy)标记为已经走过
    g[sx][sy] = true;
    // 定义四个方向的偏移量
    let dx = [-1, 0, 1, 0],
      dy = [0, 1, 0, -1];
    // 依次尝试四个方向
    for (let i = 0; i < 4; i++) {
      let x = sx + dx[i],
        y = sy + dy[i];
      // 如果(x, y)不是障碍物，且没有走过，递归调用
      // 如果走到了(tx, ty)，返回true
      if (!g[x][y] && this.check_connectivity(g, x, y, tx, ty)) return true;
    }

    return false;
  }

  create_walls() {
    // 创建一个二维布尔数组，表示是否有障碍物，初始值为false
    const g = [];
    for (let r = 0; r < this.rows; r++) {
      g[r] = [];
      for (let c = 0; c < this.cols; c++) {
        g[r][c] = false;
      }
    }

    // 给四周加上障碍物
    for (let r = 0; r < this.rows; r++) {
      g[r][0] = g[r][this.cols - 1] = true;
    }

    for (let c = 0; c < this.cols; c++) {
      g[0][c] = g[this.rows - 1][c] = true;
    }

    // 创建随机障碍物
    // 为了公平，设置整张地图为对称的，随机生成一半的障碍物
    // 当地图不为正方形时，无法做到轴对称，只能做到中心对称
    for (let i = 0; i < this.inner_walls_count / 2; i++) {
      // 如果随机生成的位置已经有障碍物了，就重新生成
      for (let j = 0; j < 1000; j++) {
        let r = parseInt(Math.random() * this.rows);
        let c = parseInt(Math.random() * this.cols);
        if (g[r][c] || g[this.rows - 1 - r][this.cols - 1 - c]) continue;
        // 如果随机生成的位置是左下角或者右上角，就重新生成
        if ((r == this.rows - 2 && c == 1) || (r == 1 && c == this.cols - 2))
          continue;

        g[r][c] = g[this.rows - 1 - r][this.cols - 1 - c] = true;
        break;
      }
    }

    // 检查是否连通。如果不连通，返回false，重新生成障碍物
    // 避免污染原布尔数组，复制一份g，然后检查
    const copy_g = JSON.parse(JSON.stringify(g));
    if (!this.check_connectivity(copy_g, this.rows - 2, 1, 1, this.cols - 2))
      return false;

    // 根据二维布尔数组，把障碍物加入到this.walls数组中
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (g[r][c]) {
          this.walls.push(new Wall(r, c, this));
        }
      }
    }

    return true;
  }

  add_listening_events() {
    this.ctx.canvas.focus();

    const [snake0, snake1] = this.snakes;
    this.ctx.canvas.addEventListener("keydown", (e) => {
      if (e.key === "w") snake0.set_direction(0);
      else if (e.key === "d") snake0.set_direction(1);
      else if (e.key === "s") snake0.set_direction(2);
      else if (e.key === "a") snake0.set_direction(3);
      else if (e.key === "ArrowUp") snake1.set_direction(0);
      else if (e.key === "ArrowRight") snake1.set_direction(1);
      else if (e.key === "ArrowDown") snake1.set_direction(2);
      else if (e.key === "ArrowLeft") snake1.set_direction(3);
    });
  }

  start() {
    for (let i = 0; i < 1000; i++) if (this.create_walls()) break;
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
