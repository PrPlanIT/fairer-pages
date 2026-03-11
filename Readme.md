![BANNER](https://raw.githubusercontent.com/prplanit/fairer-pages/main/docs/screenshots/banner.png)

# Fairer Pages

A comprehensive error pages as a service workflow. Fairer Pages is open-source, ships with 64 themes, and it also has the ability to serve fairer-pages as playlists. You will have fine grain control over your fairer-pages for each and every domain. The design is low-code so it is easier for you to understand and add your flare! Let us see your custom fairer-pages!!!

<!-- sf:project:start -->
[![badge/GitHub-source-181717?logo=github](https://img.shields.io/badge/GitHub-source-181717?logo=github)](https://github.com/prplanit/fairer-pages) [![badge/GitLab-source-FC6D26?logo=gitlab](https://img.shields.io/badge/GitLab-source-FC6D26?logo=gitlab)](https://gitlab.prplanit.com/precisionplanit/fairer-pages) [![Last Commit](https://img.shields.io/github/last-commit/prplanit/fairer-pages)](https://github.com/prplanit/fairer-pages/commits) [![Open Issues](https://img.shields.io/github/issues/prplanit/fairer-pages)](https://github.com/prplanit/fairer-pages/issues) ![github/issues-pr/prplanit/fairer-pages](https://img.shields.io/github/issues-pr/prplanit/fairer-pages) [![Contributors](https://img.shields.io/github/contributors/prplanit/fairer-pages)](https://github.com/prplanit/fairer-pages/graphs/contributors)
<!-- sf:project:end -->
<!-- sf:badges:start -->
[![build](https://raw.githubusercontent.com/prplanit/fairer-pages/main/.stagefreight/badges/build.svg)](https://gitlab.prplanit.com/precisionplanit/fairer-pages/-/pipelines) [![license](https://raw.githubusercontent.com/prplanit/fairer-pages/main/.stagefreight/badges/license.svg)](https://github.com/prplanit/fairer-pages/blob/main/LICENSE) [![release](https://raw.githubusercontent.com/prplanit/fairer-pages/main/.stagefreight/badges/release.svg)](https://github.com/prplanit/fairer-pages/releases) ![updated](https://raw.githubusercontent.com/prplanit/fairer-pages/main/.stagefreight/badges/updated.svg) [![badge/donate-FF5E5B?logo=ko-fi&logoColor=white](https://img.shields.io/badge/donate-FF5E5B?logo=ko-fi&logoColor=white)](https://ko-fi.com/T6T41IT163) [![badge/sponsor-EA4AAA?logo=githubsponsors&logoColor=white](https://img.shields.io/badge/sponsor-EA4AAA?logo=githubsponsors&logoColor=white)](https://github.com/sponsors/prplanit)
<!-- sf:badges:end -->
<!-- sf:image:start -->
[![badge/Docker-prplanit%2Ffairer--pages-2496ED?logo=docker&logoColor=white](https://img.shields.io/badge/Docker-prplanit%2Ffairer--pages-2496ED?logo=docker&logoColor=white)](https://hub.docker.com/r/prplanit/fairer-pages) [![pulls](https://raw.githubusercontent.com/prplanit/fairer-pages/main/.stagefreight/badges/pulls.svg)](https://hub.docker.com/r/prplanit/fairer-pages)

[![latest](https://raw.githubusercontent.com/prplanit/fairer-pages/main/.stagefreight/badges/latest.svg)](https://hub.docker.com/r/prplanit/fairer-pages/tags?name=latest) ![updated](https://raw.githubusercontent.com/prplanit/fairer-pages/main/.stagefreight/badges/release-updated.svg) [![size](https://raw.githubusercontent.com/prplanit/fairer-pages/main/.stagefreight/badges/release-size.svg)](https://hub.docker.com/r/prplanit/fairer-pages/tags?name=v0.0.14) [![latest-dev](https://raw.githubusercontent.com/prplanit/fairer-pages/main/.stagefreight/badges/latest-dev.svg)](https://hub.docker.com/r/prplanit/fairer-pages/tags?name=latest-dev) ![updated](https://raw.githubusercontent.com/prplanit/fairer-pages/main/.stagefreight/badges/dev-updated.svg) [![size](https://raw.githubusercontent.com/prplanit/fairer-pages/main/.stagefreight/badges/dev-size.svg)](https://hub.docker.com/r/prplanit/fairer-pages/tags?name=latest-dev)
<!-- sf:image:end -->

### Features:

|                                  |                                                                                                                                                                   |
| ---------------------------------| ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Fairer-Pages as a Service**    | Fairer-pages is deployable via docker and kubernetes, allowing you to deploy it in minutes and it is simple to add your own flair                                 |
| **Themes**                       | At the time of writing there are 64 Unique Themes, some sourced from other authors and tweaked/generated with AI. |
| **Fairer-Code Personality**      | Themes change context based on the error code encountered and configuration is simple so you can tweak everything to satisfaction. (Fairer Pages supports all codes from 4xx-5xx.) |
| **Playlists**                    | Playlists are collections of themes. Group themes by mood, purpose, or audience to curate error pages for every domain you control. |
| **Hardened Container**           | Runs non-root (UID 10000), read-only root filesystem, all capabilities dropped, no privilege escalation. Safe to put in front of your services.                  |
| **Self-Contained Documentation** | Fairer Pages ships with a copy of the relevant documentation served within the container for convenience.                                                        |

### Documentation:

|                  |                                          |
| ---------------- | ---------------------------------------- |
| Themes           | [Overview](docs/themes/README.md) / [Gallery](docs/themes/GALLERY.md) |
| Playlists        | [Guide](docs/playlists/README.md)        |
| Docker           | [Install Guide](docs/docker/README.md)   |
| Kubernetes       | [Install Guide](docs/kubernetes/README.md) |
| Nginx            | [Integration](docs/nginx/README.md)      |

## Installation

```bash
docker run -d --name fairer-pages --restart always -p 8023:8080 prplanit/fairer-pages:latest
```

> This project is near 100% HTML & JS, it should not be dependent on Docker/K8s, let alone NGINX. Feel free to explore this.

## Usage

Error pages are served at `/fairer-pages/` on the container (port 8080).

| URL Pattern | Description |
|-------------|-------------|
| `/fairer-pages/<theme>/<code>.html` | Specific theme |
| `/fairer-pages/random/<code>.html` | Random theme each time |
| `/fairer-pages/playlist/<name>/<code>.html` | Random from a named playlist |

**Examples:**

| URL | Result |
|-----|--------|
| `localhost:8023/fairer-pages/back2thefuture/404.html` | Back to the Future 404 |
| `example.com/fairer-pages/playlist/work/502.html` | Random work-appropriate 502 |
| `example.com/fairer-pages/random/404.html` | Random theme 404 |

## Contributing

- File issues with steps, logs, and versions.
- Small, focused PRs are best (typos, fairer handling, UI polish).
- Theme contributions are welcome!
- Security-related PRs and hardening suggestions are especially appreciated if you notice anything that can be improved.

## Disclaimer

The Software provided hereunder ("Software") is licensed "as-is," without warranties of any kind—express, implied, or whispered by mystical wisps. The Softwarer (yes, that's totally a word now) makes no promises about functionality, performance, compatibility, security, or availability—and absolutely no warranty of any sort. The developer shall not be held responsible, even if the software is clearly the reason your 404 page became more entertaining than your actual content, your users spent three hours clicking through every theme instead of buying anything, or your error pages gained sentience and started redirecting to Rick Astley videos.

If using this error page collection leads you down a rabbit hole of obsessive theme customization, breaks your carefully crafted nginx configs, or causes an uprising among your regex location blocks—sorry, still not liable. Also not liable if your random theme selector becomes so addictive it crashes your analytics or if your resource paths multiply like lightning bolts in a DeLorean. The developer likewise claims no credit for anything that actually goes right either. Any positive experiences are owed entirely to the unstoppable force that is the Open Source community.

Just don't blame me when your creative ways to cause errors in your environment for "testing" purposes inevitably backfires.

## License

Distributed under the [AGPL-3.0-only](LICENSE) License. See [LICENSING.md](docs/LICENSING.md) for commercial licensing.
