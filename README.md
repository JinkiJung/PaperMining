# PaperMining
PaperMining is an open-source project of a web-based collaborative paper survey tool including back- and front-end.
Through this tool, you can utilize a GitHub repository to share the references and thoughts from all collaborators and apply it to the working manuscript easier and clearer.

To support this feature, PaperMining provides four modes:
- *Collect*: collect papers for survey
- *Mine*: mine your thought by reading each paper
- *Carve*: organize and revise all thoughts
- *Plant*: plant your thoughts to your article or academic journal

The project was implemented as a prototype, [SharePaper](https://github.com/VirtualityForSafety/SharePaper), and then has been elaborated by [Jinki Jung](https://github.com/jinkijung), 

## Features
- organized thoughts (or comments) visualization that are captured from multiple papers - *Carve mode*
- configurable thought order - *Carve mode*
- reaction for each thought - *Carve mode*
- checkbox confirmation whether the thought is applied to the manuscript - *Plant mode*
- complete bibtex set exporting - *Plant mode*

## Current setup
- Remotely (read-only): PaperMining provides a web interface to explore whole contents.
- Locally: we recommend to setup local servers and commit/push the changes to your repository.

## Keep update from the PaperMining repository (when you pressed **use this template** button)
Add the template repository as a remote.

```
git remote add template https://github.com/JinkiJung/PaperMining.git
```

Then catch up the updates by running,
```
git fetch --all
```

By creating your repository from template, your repository will be an independent one which makes error when you try to merge it with the template. The command has been taught not to allow this by default, with an escape hatch *--allow-unrelated-histories* option to be used in a rare event that merges histories of two projects that started their lives independently.

```
git merge template/master --allow-unrelated-histories
```

You can get the up-to-date state of the repository after resolving conflicts from the merge.

## Required
- Node.js (required to execute a web server and update CSV files locally)

## Execute a local server
- Install [Node.js](https://nodejs.org/en/)
- Move to the repository root folder
- Execute 'npm install'
- Execute the server by 'node index.js'
- Browse 'http://localhost:5000' (can be configured in json/conf/config.json)
- Enjoy!

## Metadata license
PaperMining asserts no claims of ownership to individual items of paper metadata and associated files. 

## Dependencies
- AJV (for JSON validation): https://ajv.js.org/
- TableDnD (for sortable table implementation): http://isocra.github.io/TableDnD/
- emoji-button (for emoji reaction): https://github.com/joeattardi/emoji-button

## Contributor
 - [Jinki Jung](https://github.com/jinkijung)

## Contact
 - mail to your.jinki.jung@gmail.com

## Special thanks to
 - Thanks to [Soyeon Kim](https://github.com/soykim314), [Sua Lee](https://github.com/otterlee), and [Sangho Lee](https://github.com/kimmydkemf) who implemented the prototype (SharePaper). Also give thanks to [Hyeopwoo Lee](https://www.researchgate.net/profile/Hyeopwoo_Lee), [Kangsoo Kim](http://www.kangsookim.com/) and Hyunwoo Cho who give us a practical advise for efficient paper sharing.
