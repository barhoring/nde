import React from 'react'
import Folder from './FileTreeView/Folder.js'
import FileIcon from './FileTreeView/FileIcon.js'
import FolderIcon from './FileTreeView/FolderIcon.js'
import { ContextMenu, SubMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu/dist/react-contextmenu.js";
import cuid from 'cuid'
import fs from 'fs'
import path from 'path'
import git from 'esgit'

export default class FileNavigatorFolderComponent extends React.Component {
  constructor () {
    super()
    this.state = {
      cuid: cuid(),
    }
  }
  click () {
    this.props.glEventHub.emit('toggleFolder', this.props.filepath)
  }
  setFolderStateData (key, value) {
    this.props.glEventHub.emit('setFolderStateData', {fullpath: this.props.filepath, key, value})
  }
  newFile () {
    fs.writeFile(path.join(this.props.filepath, prompt('Enter filename:')))
  }
  newFolder () {
    fs.mkdir(path.join(this.props.filepath, prompt('Enter foldername:')))
  }
  gitInit () {
    git(this.props.filepath).init()
  }
  gitClone () {
    this.setFolderStateData('busy', true)
    git(this.props.filepath).githubToken(prompt('Github API token to use')).clone(prompt('Github URL to clone'))
    .then(() => this.setFolderStateData('busy', false))
  }
  render() {
    let {disableContextMenu, ...passedProps} = this.props
    let busyIcon = passedProps.statedata && passedProps.statedata.busy
             ? <span>&nbsp;<i className='fa fa-spinner fa-spin'></i></span>
             : ''
    return (
      <ContextMenuTrigger id={this.state.cuid} disable={disableContextMenu}>
        <Folder onClick={this.click.bind(this)} {...passedProps}>
          {busyIcon}
        </Folder>

        <ContextMenu id={this.state.cuid}>
          <SubMenu title="Git" hoverDelay={50}>
            <MenuItem onClick={() => this.gitInit()}>
              Init <FileIcon filename=".git"></FileIcon>
            </MenuItem>
            <MenuItem onClick={() => this.gitClone()}>
              Clone <FileIcon filename=".git"></FileIcon>
            </MenuItem>
          </SubMenu>

          <MenuItem onClick={() => this.newFile()}>
            New File <i className="icon text-icon"></i>
          </MenuItem>
          <MenuItem onClick={() => this.newFolder()}>
            New Folder <FolderIcon></FolderIcon>
          </MenuItem>
        </ContextMenu>
      </ContextMenuTrigger>
    )
  }
}