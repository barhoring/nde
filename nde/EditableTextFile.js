import React from 'react'
import MonacoEditor from 'react-monaco-editor'
import fs from 'fs'
import path from 'path'
import download from 'downloadjs'

const hotReload = () => {
  System.reload('./nde/app.js')
}

// This function is a total mess. I must be sleep deprived.
const mkdirs = (filename) => {
  return new Promise(function(resolve, reject) {
    let dirname = path.dirname(filename)
    let dirs = dirname.replace(/(^\/)|(\/$)/g, '').split('/').filter(x => x !== '')
    for (let i = 1; i < dirs.length + 1; i++) {
      let dir = dirs.slice(0, i).join('/')
      console.log('dir =', dir)
      try {
        fs.mkdirSync(dir)
      } catch (e) {
        if (e.code !== 'EEXIST') return reject(e)
      }
    }
    resolve()
  });
}

export default class EditableTextFile extends React.Component {
  constructor ({filepath, glContainer}) {
    super()
    this.state = {
      content: 'Loading...',
      unsavedContent: null
    }
    glContainer.setTitle(filepath)
  }
  
  editorDidMount(editor, monaco) {
    console.log('editorDidMount', editor);
    editor.addAction({
      id: 'saveFile',
      label: 'Save File',
      keybindings: [ monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S ],
      contextMenuGroupId: 'navigation',
      contextMenuOrder: 1.5,
      run: (ed) => this.saveFile()
    })
    editor.addAction({
      id: 'hotReload',
      label: 'Hot Reload Page',
      run: (ed) => this.hotReload()
    })
    editor.addAction({
      id: 'downloadFile',
      label: 'Download File',
      run: (ed) => this.downloadFile()
    })
    editor.addAction({
      id: 'reloadSavedFile',
      label: 'Reload Saved File',
      run: (ed) => this.reloadSavedFile()
    })
    editor.addAction({
      id: 'restoreOriginalFile',
      label: 'Restore Original File',
      run: (ed) => this.restoreOriginalFile()
    })
    editor.addAction({
      id: 'runCommand',
      label: 'Run',
      run: (ed) => this.runCommand()
    })
  }
  componentDidMount () {
    fs.readFile(this.props.filepath, 'utf8', (err, text) => {
      if (err) return console.log(err)
      this.setState({content: text, unsavedContent: text})
    })
  }
  runCommand () {
    return
  }
  setContainerTitle (title) {
    this.props.glContainer.setTitle(title)
  }
  onChange (newValue) {
    // TODO... what to do with file?
    this.setState({
      unsavedContent: newValue
    })
  }
  saveFile () {
    fs.writeFile(this.props.filepath, this.state.unsavedContent, 'utf8', err => console.log)
  }
  reloadSavedFile () {
    fs.readFile(this.props.filepath, 'utf8', (err, text) => {
      if (err) return console.log(err)
      this.setState({content: text, unsavedContent: text})
    })
  }
  restoreOriginalFile () {
    // We add the query parameter to thwart the service-worker.
    fetch(this.props.filepath + '?').then(res => res.text()).then(text => {
      this.setState({content: text, unsavedContent: text})
    }).catch(console.log)
  }
  downloadFile () {
    download(this.state.content, path.basename(this.props.filepath), 'text/plain')
  }
  render () {
    let onChange = this.onChange.bind(this)
    let editorDidMount = this.editorDidMount.bind(this)
    const requireConfig = {
      url: 'https://cdnjs.cloudflare.com/ajax/libs/require.js/2.3.1/require.min.js',
      paths: {
        'vs': '/nde/deps/monaco/dev/vs'
      }
    };
    const options = {
      automaticLayout: true,
      selectOnLineNumbers: true
    };
    return (
      <MonacoEditor
        language="javascript"
        theme="vs-dark"
        value={this.state.unsavedContent || this.state.content}
        options={options}
        onChange={onChange}
        editorDidMount={editorDidMount}
        requireConfig={requireConfig}
      />
    );
  }
}
