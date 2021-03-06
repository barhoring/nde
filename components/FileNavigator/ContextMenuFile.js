/* global EventHub */
import React from 'react'
import { ContextMenu, MenuItem, ContextMenuTrigger } from 'react-contextmenu'
import cuid from 'cuid'
import fs from 'fs'
import path from 'path'
import pify from 'pify'
import { prompt } from '../SweetAlert'
import { stage, remove } from './GitActions'
const noop = () => void(0)

export default class ContextMenuFile extends React.Component {
  constructor () {
    super()
    this.state = {
      cuid: cuid()
    }
  }
  deleteFile () {
    fs.unlink(this.props.filepath, noop)
  }
  async renameFile () {
    EventHub.emit('setFolderStateData', {
      fullpath: this.props.filepath,
      key: 'tentativeFilename',
      value: path.basename(this.props.filepath)
    })
    EventHub.emit('setFolderStateData', {
      fullpath: this.props.filepath,
      key: 'editingName',
      value: true
    })
    // let name = await prompt('New file name')
    // return pify(fs.rename)(this.props.filepath, path.join(path.dirname(this.props.filepath), name))
  }
  async copyFile () {
    let name = await prompt('Copy file as')
    let newfile = path.resolve(path.dirname(this.props.filepath), name)
    fs.readFile(this.props.filepath, (err, buf) => {
      if (err) return console.log(err)
      fs.writeFile(newfile, buf, () =>
        EventHub.emit('refreshGitStatusFile', newfile)
      )
    })
  }
  async addToIndex () {
    await stage({
      filepath: this.props.filepath,
      glEventHub: EventHub
    })
  }
  async removeFromIndex () {
    await remove({
      filepath: this.props.filepath,
      glEventHub: EventHub
    })
  }
  render () {
    return (
      <ContextMenuTrigger id={this.state.cuid} disable={this.props.disableContextMenu}>
        {this.props.children}
        <ContextMenu id={this.state.cuid}>
          <MenuItem onClick={() => this.addToIndex()}>
            Add to Stage <i className="icon git-icon medium-red"></i>
          </MenuItem>
          <MenuItem onClick={() => this.removeFromIndex()}>
            Mark for Deletion <i className="icon git-icon medium-red"></i>
          </MenuItem>
          <MenuItem onClick={() => this.copyFile()}>
            Copy File <i className="icon fa fa-clone"></i>
          </MenuItem>
          <MenuItem onClick={() => this.renameFile()}>
            Rename File <i className="icon fa fa-i-cursor"></i>
          </MenuItem>
          <MenuItem onClick={() => this.deleteFile()}>
            Delete File <i className="icon fa fa-trash"></i>
          </MenuItem>
        </ContextMenu>
      </ContextMenuTrigger>
    )
  }
}
