---
title: KDE Plasma 6.7 KRDP 连接后立即断开问题
date: 2026-07-06 20:32
author: AnyJohn
tags:
  - Linux
  - Wayland
  - CachyOS
---

# KDE Plasma 6.7 KRDP 连接后立即断开问题排查

## 一、问题现象

环境：

- KDE Plasma 6.7.2
- Wayland 会话
- KRDP（KDE Remote Desktop）
- 客户端：Windows RDP

表现：

- 能正常看到连接建立
- 黑屏约 1 秒
- 客户端立即断开
- 服务端 krdpserver 无崩溃，但连接失败

---

## 二、初始日志特征

```javascript
New client connectedpam_unix(login:auth): authentication failurepassword check failed for user
```

随后出现：

```javascript
PostConnect for peer failedSTATE_RUN_FAILEDBIO_read returned system error 104 (connection reset)
```

---

## 三、第一阶段根因：PAM / systemd 安全限制

### 关键线索

```javascript
pam_unix(login:auth): authentication failureunix_chkpwd: user unknown
```

以及 systemd 服务属性：

```javascript
systemctl --user show app-org.kde.krdpserver.service -p NoNewPrivilegesNoNewPrivileges=yes
```

---

### 问题本质

KRDP 通过 PAM 调用系统认证：

- `unix_chkpwd`
- `pam_unix`
- polkit / system-auth

但 `NoNewPrivileges=yes` 会导致：

- PAM helper 无法正常 fork/exec
- 密码校验失败
- 连接立即断开

这是 KDE/Plasma 6.7 已知回归问题之一（KRDP + systemd sandbox 冲突）。

---

## 四、修复方案（关键）

创建 systemd override：

```javascript
mkdir -p ~/.config/systemd/user/app-org.kde.krdpserver.service.dcat > ~/.config/systemd/user/app-org.kde.krdpserver.service.d/override.conf << EOF[Service]NoNewPrivileges=falseEOFsystemctl --user daemon-reloadsystemctl --user restart app-org.kde.krdpserver.service
```

---

## 五、修复后变化

修复前：

```javascript
pam_authenticate failureconnection reset immediately
```

修复后：

```javascript
New client connectedVAAPI encoder initializedsession established
```

说明 PAM 阶段已经恢复正常。

---

## 六、第二阶段问题（已验证但未最终影响）

日志中仍存在：

```javascript
WITH_VAAPI_H264_ENCODING=ON (experimental)QObject thread mismatch warningVAAPI Intel iHD driver in use
```

但：

- 不影响最终连接
- 仅在建立阶段输出 warning
- 不再触发断开

---

## 七、最终结论

本问题是 KDE KRDP 6.7 的典型组合问题：

### 根因链路

```javascript
systemd sandbox（NoNewPrivileges=yes）        ↓PAM helper 无法执行        ↓authentication failure        ↓FreeRDP session abort        ↓客户端黑屏后断开
```

---

## 八、解决方案总结

### 必须修复

```javascript
NoNewPrivileges=false
```

### 可选优化

- 避免使用实验性 VAAPI H264（如有 GPU 兼容问题）
- 更新 freerdp / kpipewire
- 保持 Plasma 6.7.x 最新补丁

---

## 九、经验总结

KRDP 当前状态（Plasma 6.6–6.7）特点：

- 功能可用，但系统依赖链较敏感
- PAM / systemd sandbox / VAAPI 三者耦合
- 小更新可能引入认证或编码路径问题
- 更适合“可接受偶发 bug”的远程使用场景
