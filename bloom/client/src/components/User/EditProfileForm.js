import React from 'react';
import '../../App.css';
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import InputGroup from 'react-bootstrap/InputGroup'
import { FaLockOpen, FaLock, FaUser, FaPhone } from 'react-icons/fa';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { bindActionCreators } from 'redux';
import {editUser} from './UserHelper'
import { getPictures, deleteHandler, uploadHandler } from '../s3'
import { connect } from 'react-redux';
import { css } from '@emotion/core'
import GridLoader from 'react-spinners/GridLoader'
import { FilePond, registerPlugin } from 'react-filepond';
import 'filepond/dist/filepond.min.css';
import CropperEditor from './Cropper';
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import FilePondPluginImageExifOrientation from "filepond-plugin-image-exif-orientation";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import FilePondPluginImageCrop from "filepond-plugin-image-crop";
import FilePondPluginImageResize from "filepond-plugin-image-resize";
import FilePondPluginImageTransform from "filepond-plugin-image-transform";
import FilePondPluginImageEdit from "filepond-plugin-image-edit";
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';
const fetchDomain = process.env.NODE_ENV === 'production' ? process.env.REACT_APP_FETCH_DOMAIN_PROD : process.env.REACT_APP_FETCH_DOMAIN_DEV;

// Register the plugins for filepond
registerPlugin(
  FilePondPluginFileValidateType,
  FilePondPluginImageExifOrientation,
  FilePondPluginImagePreview,
  FilePondPluginImageCrop,
  FilePondPluginImageResize,
  FilePondPluginImageTransform,
  FilePondPluginImageEdit,
);

const pond = React.createRef();
const override = css`
  display: block;
  margin: 0 auto;
`;

class EditProfileForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: {
        first_name: '',
        last_name: '',
        phone: '',
        password: '',
        password_confirmation: '',
        id: ''
      },
      files: [],
      originalFiles: [],
      image: null,
      modalShow: false,
      editor: {
        // Called by FilePond to edit the image
        // - should open your image editor
        // - receives file object and image edit instructions
        open: (file, instructions) => {
          this.setModalShow(true);
          this.setState({image: (URL.createObjectURL(file))});
        },

        // Callback set by FilePond
        // - should be called by the editor when user confirms editing
        // - should receive output object, resulting edit information
        onconfirm: output => {},

        // Callback set by FilePond
        // - should be called by the editor when user cancels editing
        oncancel: () => {},

        // Callback set by FilePond
        // - should be called by the editor when user closes the editor
        onclose: () => {}
      },
      toUpload: 0,
      uploaded: 0,
      deleted: 0,
      selectedFiles: [],
      keys: [],
      isLoading: true
    }
    // RegEx for phone number validation
    this.phoneRegExp = /^(\+?\d{0,4})?\s?-?\s?(\(?\d{3}\)?)\s?-?\s?(\(?\d{3}\)?)\s?-?\s?(\(?\d{4}\)?)?$/
    // this.emailRegExp = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/
    // Schema for yup
    this.yupValidationSchema = Yup.object().shape({
      first_name: Yup.string()
      .min(2, "First name must have at least 2 characters")
      .max(100, "First name can't be longer than 100 characters")
      .required("First name is required"),
      last_name: Yup.string()
      .min(2, "Last name must have at least 2 characters")
      .max(100, "Last name can't be longer than 100 characters")
      .required("Last name is required"),
      // email: Yup.string()
      // .email("Must be a valid email address")
      // .max(100, "Email must be less than 100 characters")
      // .required("Email is required"),
      phone: Yup.string()
      .matches(this.phoneRegExp, "Phone number is not valid"),
      password: Yup.string()
      .min(6, "Password must have at least 6 characters")
      .max(100, "Password can't be longer than 100 characters")
      .required("Password is required"),
      password_confirmation: Yup.string()
      .oneOf([Yup.ref('password')], 'Passwords do not match')
      .required("Password confirmation is required"),
    });
    this.handleEdit = this.handleEdit.bind(this);
  }

  handleEdit (data, item) {
    this.state.editor.onconfirm({
      data
    });
    this.setState({
      croppedFile: item
    })
  };

  componentDidUpdate(prevProps, prevState)  {
    if (prevProps.user !== this.props.user) {
      this.props.history.push({
        pathname: '/users/' + this.props.user.id,
      })
    }
  }

  setModalShow(condition) {
    this.setState({
      modalShow: condition
    })
  }

  async componentDidMount(){
    if(this.props.picture){
      this.setState({
        files: [{
          source: this.props.picture.url,
          options: {
              type: 'local'
          }
        }],
        originalFiles: [{
          source: this.props.picture.url,
          options: {
              type: 'local'
          }
        }],
        key: this.props.picture.key,
        isLoading: false
      })
    }
    else{
      let picturesFetched = []
      try {
        picturesFetched = await getPictures('users/' + this.props.user.id + '/')

        if(picturesFetched.length > 0){
          // check count!!!!!
          await this.setState({
            files: [{
              source: picturesFetched[0].url,
              options: {
                  type: 'local'
              }
            }],
            originalFiles: [{
              source: this.props.picture.url,
              options: {
                  type: 'local'
              }
            }],
            key: this.props.picture.key,
            isLoading: false
          })
        }
        else{
          await this.setState({
            isLoading: false
          })
        }
      } catch (e) {
        console.log("Error getting pictures from s3!", e)
      }
    }
  }

  render() {
    if(this.state.isLoading){
      return <Row className="vertical-center">
               <Col>
                <GridLoader
                  css={override}
                  size={20}
                  color={"#2196f3"}
                  loading={this.state.isLoading}
                />
              </Col>
            </Row>
    }
    else{
      // lord forgive me for writing this hack, fix getting s3 images on load to avoid this
      document.getElementsByClassName("filepond--file-wrapper")[0] && this.props.picture && (document.getElementsByClassName("filepond--file-wrapper")[0].style['background-image'] = 'url(' + this.props.picture.url + ')')
      document.getElementsByClassName("filepond--file-wrapper")[0] && (document.getElementsByClassName("filepond--file-wrapper")[0].style['backgroundSize'] = 'cover')
      // remove this whence they allow you customize buttons more with filepond. EditItem prop doesn't exist as of rn
      document.getElementsByClassName("filepond--action-edit-item")[0] && (document.getElementsByClassName("filepond--action-edit-item")[0].dataset.align = "bottom right")
      return (
        <Container fluid>
          <Row className="justify-content-center my-5">
            <Col xs={12} lg={5}>
              <Formik
                // enableReinitialize
                initialValues={{
                  first_name: this.props.user.first_name,
                  last_name: this.props.user.last_name,
                  phone: this.props.user.phone,
                  password: '',
                  password_confirmation: '',
                  id: 0,
                }}
                validationSchema={this.yupValidationSchema}
                onSubmit={async (values) => {
                  values.id = this.props.user.id
                  values.role = this.props.user.role
                  let needsUpdate = false
                  if(this.state.key) {
                    let query = this.state.originalFiles[0].source.split('/')[5]
                    let name = query.split('?')[0]
                    if(name !== this.state.files[0].name) {
                      needsUpdate = true
                      // remove files from s3
                      try {
                        await deleteHandler([this.state.key])
                      } catch (e) {
                        console.log("Error! Could not delete images from s3", e)
                      }
                    }
                  }
                  if(needsUpdate || (!this.state.key && this.state.files.length > 0)){
                    //set this to true for updateProfileContent function
                    needsUpdate = true
                    // upload new images to s3 from client to avoid burdening back end
                    let prefix = 'users/' + this.props.user.id + '/'
                    if(this.state.croppedFile) {
                      try {
                        await uploadHandler(prefix, [this.state.croppedFile])
                      } catch (e) {
                        console.log("Error! Could not upload images to s3", e)
                      }
                    } else {
                      try {
                        await uploadHandler(prefix, this.state.files)
                      } catch (e) {
                        console.log("Error! Could not upload images to s3", e)
                      }
                    }
                  }
                  this.props.editProfile(values)
                  this.props.updateProfileContent(needsUpdate, values.first_name, values.last_name)
                }}
              >
              {( {values,
                  errors,
                  touched,
                  handleChange,
                  handleBlur,
                  handleSubmit,
                  setFieldValue}) => (
                <Form className="rounded">
                  <Form.Group controlId="picture">
                    <FilePond
                      ref={pond}
                      allowMultiple={false}
                      allowImageCrop={true}
                      allowImageTransform={true}
                      imageCropAspectRatio={'1:1'}
                      imageResizeTargetWidth={200}
                      imageResizeTargetHeight={200}
                      imageEditEditor={this.state.editor}
                      instantUpload={false}
                      files={this.state.files}
                      stylePanelLayout='compact circle'
                      styleButtonRemoveItemPosition='left bottom'
                      onupdatefiles={fileItems => {
                        // Set currently active file objects to this.state
                        this.setState({
                          files: fileItems.map(fileItem => fileItem.file)
                        });
                      }}
                      server={{
                        // fetch the image from our server, a little buggy bc of s3 permissions issues related to cors and maybe browser caching.
                        load: (source, load) => {
                          var myRequest = new Request(source);
                          const options = {
                            method: 'get',
                            headers: new Headers({'content-type': 'application/json'}),
                            mode: 'no-cors'}
                          fetch(myRequest, options).then(function(response) {
                            response.blob().then(function(myBlob) {
                              load(myBlob);
                            });
                          });
                        },
                        process: `${fetchDomain}/profiles/${this.props.user.id}`,
                        revert: `${fetchDomain}/profiles/${this.props.user.id}`
                      }}
                      onwarning={(error) => {console.log(error)}}
                    >
                    </FilePond>
                    <CropperEditor image={this.state.image} show={this.state.modalShow} onCrop={this.handleEdit} onHide={() => {this.setModalShow(false)}} pond={pond}/>
                  </Form.Group>

                  <h1>Edit Profile</h1>

                  <Form.Group controlId="formFirstName">
                    <InputGroup>
                      <InputGroup.Prepend>
                          <InputGroup.Text>
                              <FaUser/>
                          </InputGroup.Text>
                      </InputGroup.Prepend>
                      <Form.Control
                        type="text"
                        name="first_name"
                        value={values.first_name}
                        placeholder="First Name"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={touched.first_name && errors.first_name ? "error" : null}/>
                    </InputGroup>
                    {touched.first_name && errors.first_name ? (
                      <div className="error-message">{errors.first_name}</div>
                    ): null}
                  </Form.Group>

                  <Form.Group controlId="formLastName">
                    <InputGroup>
                      <InputGroup.Prepend>
                          <InputGroup.Text>
                              <FaUser/>
                          </InputGroup.Text>
                      </InputGroup.Prepend>
                      <Form.Control type="text"
                      value={values.last_name}
                      placeholder="Last Name"
                      name="last_name"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={touched.last_name && errors.last_name ? "error" : null}/>
                    </InputGroup>
                    {touched.last_name && errors.last_name ? (
                      <div className="error-message">{errors.last_name}</div>
                    ): null}
                  </Form.Group>

                  <Form.Group controlId="formPhone">
                    <InputGroup>
                      <InputGroup.Prepend>
                          <InputGroup.Text>
                              <FaPhone/>
                          </InputGroup.Text>
                      </InputGroup.Prepend>
                      <Form.Control type="text"
                        value={values.phone}
                        placeholder="Phone Number"
                        name="phone"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={touched.phone && errors.phone ? "error" : null}/>
                    </InputGroup>
                    {touched.phone && errors.phone ? (
                      <div className="error-message">{errors.phone}</div>
                    ): null}
                  </Form.Group>

                  <Form.Group controlId="formPassword">
                    <InputGroup>
                      <InputGroup.Prepend>
                          <InputGroup.Text>
                              <FaLockOpen/>
                          </InputGroup.Text>
                      </InputGroup.Prepend>
                      <Form.Control
                        type="password"
                        value={values.password}
                        placeholder="Password"
                        name="password"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={touched.password && errors.password ? "error" : null}/>
                    </InputGroup>
                    {touched.password && errors.password ? (
                      <div className="error-message">{errors.password}</div>
                    ): null}
                  </Form.Group>

                  <Form.Group controlId="formPasswordConfirmation">
                    <InputGroup>
                      <InputGroup.Prepend>
                          <InputGroup.Text>
                              <FaLock/>
                          </InputGroup.Text>
                      </InputGroup.Prepend>
                      <Form.Control
                        type="password"
                        value={values.password_confirmation}
                        placeholder="Confirm Password"
                        name="password_confirmation"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={touched.password_confirmation && errors.password_confirmation ? "error" : null}/>
                    </InputGroup>
                    {touched.password_confirmation && errors.password_confirmation ? (
                      <div className="error-message">{errors.password_confirmation}</div>
                    ): null}
                  </Form.Group>
                  <Button style={{backgroundColor: '#8CAFCB', border: '0px'}} onClick={handleSubmit}>Submit</Button>
                </Form>
              )}
              </Formik>
            </Col>
          </Row>
        </Container>
      );
    }
  }
}

const mapStateToProps = state => ({
  user: state.userReducer.user
})

const mapDispatchToProps = dispatch => bindActionCreators({
  editProfile: (email, password, auth_token) => editUser(email, password, auth_token)
}, dispatch)


export default connect(mapStateToProps, mapDispatchToProps)(EditProfileForm);
