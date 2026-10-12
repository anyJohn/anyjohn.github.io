---
title: 用 Pico 2 W 给 Stadia 手柄做无线接收器（joypad-os）
date: 2026-10-11 00:12
author: AnyJohn
tags:
  - 游戏人生
  - 硬件
  - 手柄
---

# 用 Pico 2 W 给 Stadia 手柄做无线接收器（joypad-os）

Stadia 云游戏服务关了，但手柄本身是块好料：它内置蓝牙，切到蓝牙模式后就是一个标准的 BT HID 手柄。麻烦的地方在"接收端"：你得让电脑认出它，而且最好不依赖主板自己的蓝牙。

[joypad-os](https://github.com/joypad-ai/joypad-os) 解决的就是这一层：把一块 Pico 变成蓝牙手柄到 USB 手柄的转接器。手柄用蓝牙连 Pico，Pico 用 USB 连电脑，电脑看到的是一只有线手柄。

下面是完整的编译和刷写过程。编译和产物校验在一台 CachyOS 上跑过，刷写和配对部分按项目官方文档整理。

---

## 一、这套东西在做什么

```
[Stadia 手柄] --蓝牙--> [Pico 2 W / joypad-os bt2usb] --USB--> [PC / 主机]
   BT HID 主机侧           蓝牙主机 + USB 从机            标准 USB 手柄
```

Pico 2 W 上那颗 CYW43439 无线芯片支持蓝牙经典（Classic）和 BLE，所以它既能当蓝牙主机（连手柄），又能通过 USB 当从机（装成手柄）。整条链路里没有需要焊的东西，插上线就行。

为什么要绕这么一圈，而不是直接用主板蓝牙：

- 电脑看到的是一只标准 USB 手柄，游戏和模拟器的兼容性比走系统蓝牙栈好
- 手柄可以在不同设备间搬（换机器不用重新配对系统蓝牙）
- 旧手柄、杂牌手柄没有原生驱动时，这一层能统一成 USB HID

`bt2usb` 支持全部 4 个平台：Pico W、Pico 2 W（Classic BT + BLE）、ESP32-S3、nRF52840（后两个只有 BLE）。下面用 Pico 2 W。

---

## 二、需要的东西

| 东西 | 说明 |
|---|---|
| Pico 2 W | RP2350 + CYW43439，自带蓝牙和原生 USB，不需要额外接线 |
| micro-USB 数据线 | **必须是能传数据的**，只能充电的线刷不了机也认不出设备 |
| 一台编译机 | Linux / macOS / WSL 都行，我用的 CachyOS |
| Stadia 手柄 | **前提：已经切到蓝牙模式**（见 2.1） |

### 2.1 Stadia 手柄这个前提

Stadia 手柄出厂时不是标准蓝牙手柄。它走 Wi-Fi 直连，配对的是 Stadia 的服务端。Google 在关停 Stadia 之后放过一个解锁工具，把手柄固件切成蓝牙模式，切过之后它就是一个普通的 BT HID 手柄，手机、电脑都能直接搜到。

判断手里这只是不是已经解锁过，最简单的办法是拿手机开蓝牙搜索，把手柄切到配对状态，看能不能搜到一个 Google 的手柄设备。能搜到就是蓝牙模式，可以往下走。

没解锁过的手柄得先走 Google 那个工具。它官方说法是 2024 年底关停，目前还能不能用我没有核实【待核实】，卡在这一步的话先确认这条路还在不在。

---

## 三、编译固件

### 3.1 装 ARM 工具链

Pico 系列是 ARM Cortex-M，需要一个交叉编译器。Arch 系：

```bash
sudo pacman -S arm-none-eabi-gcc arm-none-eabi-newlib cmake make python3
```

Debian/Ubuntu 对应的包是 `gcc-arm-none-eabi` 和 `libnewlib-arm-none-eabi`。macOS 用 `brew install arm-none-eabi-gcc cmake`。

### 3.2 拉源码

```bash
git clone --recurse-submodules --shallow-submodules --depth 1 \
  https://github.com/joypad-ai/joypad-os.git
cd joypad-os
```

`--recurse-submodules` 不能省。仓库把 pico-sdk 和它自己的 tinyusb fork 都放在子模块里，少拉一个就是编译到一半报缺文件。

### 3.3 一条命令出固件

```bash
make bt2usb_pico2_w
```

产物在 `releases/`：

```
releases/joypad_os_<commit>_bt2usb_pico2_w.uf2
```

目标名是 `make <app>_<board>` 的格式。翻 `Makefile` 能看到所有组合，光是 `pico2_w` 就有 13 个：`bt2usb`、`btusb2usb`、`usb2usb`、`bt2gc`、`bt2n64`、`bt2nuon`、`usb2ble`、`universal` 等，整份 Makefile 里有 109 个目标。

这条命令背后做的事，`src/boards/build_pico2_w.sh` 里就一行：

```bash
cmake -G "Unix Makefiles" -DPICO_BOARD=pico2_w -B build
```

`PICO_BOARD=pico2_w` 会被 pico-sdk 展开成 `PICO_PLATFORM=rp2350-arm-s`（RP2350 的 ARM 安全态），所以产出的镜像是给 RP2350 的，不是 RP2040 的。

第一次编译会额外花一两分钟：CMake 会把 `picotool` 拉到 `~/.picotool` 自己编一遍，之后的编译都是增量。

### 3.4 确认固件里真有 Stadia 支持（可选）

编译通过不等于你要的驱动被链进去了。`bt2usb` 支持一堆手柄，Stadia 的驱动在 `src/bt/bthid/devices/vendors/google/stadia_bt.c`。直接查符号表：

```bash
arm-none-eabi-nm src/build/joypad_bt2usb.elf | grep -i stadia
```

看到这几行就说明驱动真的进了固件：

```
1007eb74 R BT_PROFILE_STADIA
1007e934 R stadia_bt_driver
100227c4 T stadia_bt_register
```

顺手确认镜像是给对芯片的（UF2 每个 512 字节块的头里带族 ID）：

```python
import struct
b = open("releases/joypad_os_xxx_bt2usb_pico2_w.uf2", "rb").read()
fam = {struct.unpack("<8I", b[i:i+32])[7] for i in range(0, len(b), 512)}
print([hex(x) for x in fam])
```

输出 `['0xe48bff57', '0xe48bff59']`。`...59` 是 RP2350 ARM 安全态的族 ID，`...57` 是 SDK 加在首块的"绝对族"标记块，两个一起出现才是正常的 RP2350 镜像。要是看到 `0xe48bff56`，那是 RP2040 的，刷不到 Pico 2 W 上。

---

## 四、刷进 Pico 2 W

1. 按住板子上的 **BOOTSEL** 键不放
2. 保持按住，把 micro-USB 插到电脑上，再松开
3. 系统里会挂出一个 U 盘（Pico 1 显示为 `RPI-RP2`，Pico 2 系列是 `RP2350`）
4. 把 `.uf2` 拖进去。文件拷完板子会自动重启，U 盘自动消失
5. 拔下来插到你要用的设备上，它就是一个 USB 手柄了

不用装驱动，不用 `picotool`，拖拽就行。这也是 Pico 比 ESP32 舒服的地方。

---

## 五、配对手柄

刷完之后：

1. 把 Pico 2 W 插到电脑（或主机）上
2. 把 Stadia 手柄切到蓝牙配对模式 —— 组合键以 Google 官方说明为准【待核实：我这边没能联网核实这一步的具体按键，如果你的手柄灯一直没反应，先查官方文档】
3. 板子在没有手柄连接时会自动扫描，扫到就自己连上，不需要在电脑上做任何操作
4. 用 [gamepad-tester.com](https://gamepad-tester.com/) 或者 Steam 的控制器设置确认按键、摇杆、扳机都对
5. 震动会从电脑转发回蓝牙手柄

**板载 LED 的语义**（判断卡在哪一步主要靠它）：

| LED | 含义 |
|---|---|
| 快速闪（约 0.2 秒一次） | 处在显式配对窗口里（点一下 BOOTSEL 打开，60 秒） |
| 慢速闪（约 0.8 秒一次） | 空闲：没连上任何手柄，在扫描/重连 |
| 常亮 | 至少有一个手柄已连接 |

注意慢闪是"没设备"的状态，不是"正在配对"。如果你是要配一个新动过的手柄，点一下 BOOTSEL 开配对窗口，让灯进入快闪。

**配第二个手柄**：自动扫描只在"一个手柄都没连"的时候跑。已经连了一只之后想再加一只，得点一下 BOOTSEL 打开 60 秒配对窗口（灯转快闪），再去开手柄的配对模式。多只手柄的输入会合并成一路 USB 输出。

**配对信息会写进 flash**，断电重启后自动重连，不用每次重配。

---

## 六、BOOTSEL 是它唯一的人机界面

刷好之后板子上没有任何按键之外的交互，全部操作都在 BOOTSEL 上：

| 操作 | 效果 |
|---|---|
| 单击 | 打开 60 秒蓝牙扫描窗口（配新手柄用） |
| 双击 | 切换 USB 输出模式 |
| 三击 | 强制回到 SInput 模式 |
| 长按 | 断开所有手柄，**并清空所有配对信息** |

双击循环的模式顺序：

```
SInput -> XInput -> PS3 -> PS4 -> Switch -> 键盘鼠标 -> SInput
```

**这里是第一个容易翻车的地方**：新刷的板子默认是 **SInput**（通用 HID 手柄）。Windows 上很多游戏只读 XInput，结果就是"设备管理器里明明有这个手柄，游戏里就是没反应"。遇到这种情况双击 BOOTSEL 切到 XInput 就行。每次切换 USB 会重新枚举一次，系统会"叮咚"一声。

所选模式同样存在 flash 里，掉电保持。如果哪天它莫名其妙出现在别的模式里，三击强制回 SInput。

更冷门的模式（DInput、PS Classic、初代 Xbox、Xbox One、XAC）不在循环里，需要通过 CDC 配置接口设置。

---

## 七、踩过的坑

**1. micro-USB 线只充电不传数据**

最经典的坑。表现是：板子插上只亮灯，电脑那边什么都不出现，BOOTSEL 驱动盘也挂不出来。换一根确定能传数据的线。

**2. `http_proxy` 环境变量让 clone 直接报废**

如果你的 shell 里全局导出了 `http_proxy` / `https_proxy`（国内用代理的机器很常见），而代理本身又不通，那 `git clone` 会连着所有子模块一起失败，报的还是连接层面的错，看起来像"GitHub 挂了"。绕开：

```bash
env -u http_proxy -u https_proxy -u all_proxy \
  git clone --recurse-submodules https://github.com/joypad-ai/joypad-os.git
```

用 `curl` 排查时同理，加 `--noproxy '*'`。判断方法很简单：直连 GitHub 和走代理各试一次，看哪个是 200。

**3. 子模块没拉全**

`git clone` 不加 `--recurse-submodules`，会在编译到蓝牙协议栈的时候才报错，错误信息不会告诉你"你少拉了一个子模块"。已经 clone 过了的话，进目录补一句 `git submodule update --init --recursive`。

**4. 手柄连不上 / 游戏里没反应**

按这个顺序查，别乱试：灯是什么状态 → 慢闪说明没连上（点 BOOTSEL 开配对窗口）→ 常亮说明连上了（那问题在输出模式，双击切 XInput）→ 还是不行再回来看是不是手柄侧没进蓝牙配对模式。

---

## 八、这套方法是通用的

`make <app>_<board>` 这个命名规则意味着换个目标就换了个用途，不用改代码：

| 目标 | 用途 |
|---|---|
| `bt2usb_pico2_w` | 这次要用的：蓝牙手柄 → USB 手柄 |
| `btusb2usb_pico2_w` | 蓝牙手柄 **或** 有线 USB 手柄 → USB 手柄（想同时兼容有线就选它） |
| `usb2usb_pico2_w` | 纯有线 USB 手柄转换 |
| `bt2gc_pico2_w` / `bt2n64_pico2_w` / `bt2nuon_pico2_w` | 蓝牙手柄 → 老主机接口（NGC / N64 / Nuon） |
| `universal_pico2_w` | 多协议合一 |

板子也不限于 Pico 2 W：仓库里覆盖 Pico W、Pico 2 W、ESP32-S3、nRF52840，一共 109 个 `make` 目标。ESP32-S3 和 nRF52840 只有 BLE，连不了用蓝牙经典的手柄；要 Classic BT 就得用 Pico W / Pico 2 W。

想要更细的按键重映射、死区、连发之类的设置，项目还提供了 web 配置页面（通过 CDC 接口），这块不展开。

---

## 结语

joypad-os 把编译这一层收成了一条 `make <app>_<board>`，剩下的成本主要在两件事上：确认工具链和板型对得上，以及读懂设备的灯在说什么。BOOTSEL 的四种操作和 LED 的三种闪法，建议动手之前先过一遍。
