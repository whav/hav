import React from 'react'
import { Button, Header, Image, Modal } from 'semantic-ui-react'

class ModalExample extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      open: true
    }
  }
  close() {
    this.setState({open: false})
  }
  render() {
    return (
    <Modal open={this.state.open} closeIcon={true} onClose={() => this.close()}>
      <Modal.Header>Select a Photo</Modal.Header>
      <Modal.Content image>
        <Modal.Description>
          <Header>Default Profile Image</Header>
          <p>We've found the following gravatar image associated with your e-mail address.</p>
          <p>Is it okay to use this photo?</p>
        </Modal.Description>
      </Modal.Content>
    </Modal>
)}
}

export {ModalExample}