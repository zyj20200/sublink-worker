<div align="center">
  <img src="public/favicon.png" alt="Sublink Worker" width="120" height="120"/>

  <h1><b>Sublink Worker</b></h1>
  <h5><i>一个 Worker，所有订阅</i></h5>

  <p><b>轻量级代理协议订阅转换与管理工具，支持部署到 Cloudflare Workers、Vercel、Node.js 或 Docker。</b></p>

  <p><a href="README_EN.md">English</a> | 中文</p>

  <a href="https://trendshift.io/repositories/12291" target="_blank">
    <img src="https://trendshift.io/api/badge/repositories/12291" alt="zyj20200%2Fsublink-worker | Trendshift" width="250" height="55"/>
  </a>

  <br>

<p style="display: flex; align-items: center; gap: 10px;">
  <a href="https://deploy.workers.cloudflare.com/?url=https://github.com/zyj20200/sublink-worker">
    <img src="https://deploy.workers.cloudflare.com/button" alt="Deploy to Cloudflare Workers" style="height: 32px;"/>
  </a>
  <a href="https://vercel.com/new/clone?repository-url=https://github.com/zyj20200/sublink-worker&env=KV_REST_API_URL,KV_REST_API_TOKEN&envDescription=Vercel%20KV%20credentials%20for%20data%20storage&envLink=https://vercel.com/docs/storage/vercel-kv">
    <img src="https://vercel.com/button" alt="Deploy to Vercel" style="height: 32px;"/>
  </a>
</p>

  <h3>📚 文档</h3>
  <p>
    <a href="https://app.sublink.works"><b>⚡ 在线演示</b></a> ·
    <a href="https://sublink.works"><b>中文文档</b></a> ·
    <a href="https://sublink.works/en/"><b>English Docs</b></a>
  </p>
  <p>
    <a href="https://sublink.works/guide/quick-start/">快速开始</a> ·
    <a href="https://sublink.works/api/">API 参考</a> ·
    <a href="https://sublink.works/guide/faq/">常见问题</a>
  </p>
</div>

## 🚀 快速开始

### 一键部署
- 点击上方的 "deploy" 按钮即可
- 就是这么简单！更多信息请参阅[文档](https://sublink.works/guide/quick-start/)。

### 其他运行方式
- **Node.js**: `npm run build:node && node dist/node-server.cjs`
- **Vercel**: `vercel deploy`（在项目设置中配置 KV）
- **Docker**: `docker pull ghcr.io/7sageer/sublink-worker:latest`
- **Docker Compose**: `docker compose up -d`（包含 Redis）

## ✨ 功能特性

### 支持的协议
ShadowSocks • VMess • VLESS • Hysteria2 • Trojan • TUIC

### 客户端支持
Sing-Box • Clash • Xray/V2Ray • Surge

### 输入支持
- Base64 订阅链接
- HTTP/HTTPS 订阅链接
- 完整配置文件（Sing-Box JSON、Clash YAML、Surge INI）

### 核心能力
- 从多个来源导入订阅
- 生成固定/随机短链接（基于 KV 存储）
- 亮色/暗色主题切换
- 灵活的 API 接口，方便脚本自动化
- 多语言支持（中文、英文、波斯语、俄语）
- Web 界面支持预定义规则集、可自定义策略组和自定义规则集 URL

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改进本项目。

## 📄 许可证

本项目基于 MIT 许可证开源 - 详情请参阅 [LICENSE](LICENSE) 文件。

## ⚠️ 免责声明

本项目仅供学习和交流使用，请勿用于非法用途。因使用本项目而产生的一切后果由用户自行承担，与开发者无关。

## 💰 赞助

<div align="center">
  <h3>感谢以下赞助商对本项目的支持</h3>
<table border="0">
  <tr>
    <td>
      <a href="https://yxvm.com/" target="_blank" title="YXVM">
        <img src="https://image.779477.xyz/yxvm.png" alt="YXVM" height="60" hspace="20"/>
      </a>
    </td>
    <td>
      <a href="https://github.com/NodeSeekDev/NodeSupport" target="_blank" title="NodeSupport">
        <img src="https://image.779477.xyz/ns.png" alt="NodeSupport" height="60" hspace="20"/>
      </a>
    </td>
  </tr>
</table>
  <p>如果您想赞助本项目，请联系开发者 <a href="https://github.com/7Sageer" style="text-decoration: none;">@7Sageer</a></p>
</div>

## ⭐ Star 历史

感谢每一位给本项目 Star 的朋友！🌟

<a href="https://star-history.com/#7Sageer/sublink-worker&Date">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=7Sageer/sublink-worker&type=Date&theme=dark" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=7Sageer/sublink-worker&type=Date" />
   <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=7Sageer/sublink-worker&type=Date" />
 </picture>
</a>
 