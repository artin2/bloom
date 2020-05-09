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
import {editUser} from '../../reduxFolder/redux.js'
import { getPictures, deleteHandler, uploadHandler } from '../s3'
import { connect } from 'react-redux';
import { css } from '@emotion/core'
import GridLoader from 'react-spinners/GridLoader'
import { Image } from 'react-bootstrap';
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
      picture: null,
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
      pictureCount: Yup.number()
      .required("Pictures are required")
      .min(1, "Must upload a picture")
      .max(1, "Too many pictures!")
    });
  }

  deleteFileChangeHandler = async (event, setFieldValue) => {
    if(event.target.checked){
      setFieldValue("pictureCount", this.state.uploaded + this.state.toUpload - 1)
      this.setState({
        deleted: 1,
        keys: [event.target.id]
      })
    }
    else{
      setFieldValue("pictureCount", this.state.uploaded + this.state.toUpload - 0)
      this.setState({
        deleted: 0,
        keys: []
      })
    }
  }

  fileChangedHandler = async (event, setFieldValue) => {
    if(event.target.files.length > 0){
      setFieldValue("pictureCount", this.state.uploaded + 1 - this.state.deleted)
      this.setState({ selectedFiles: event.target.files, toUpload: 1 })
    }
    else{
      setFieldValue("pictureCount", this.state.uploaded - this.state.deleted)
      this.setState({ selectedFiles: event.target.files, toUpload: 0 })
    }
  }

  componentDidUpdate(prevProps, prevState)  {
    if (prevProps.user !== this.props.user) {
      this.props.history.push({
        pathname: '/users/' + this.props.user.id,
      })
    }
  }

  async componentDidMount(){
    if(this.props.picture){
      this.setState({
        picture: this.props.picture,
        uploaded: 1,
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
            picture: picturesFetched[0],
            uploaded: 1,
            isLoading: false
          })
        }
        else{
          await this.setState({
            uploaded: 0,
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
      let del;

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
                  picture: [],
                  pictureCount: this.state.uploaded + this.state.toUpload - this.state.deleted,
                }}
                validationSchema={this.yupValidationSchema}
                onSubmit={async (values) => {
                  values.id = this.props.user.id
                  values.role = this.props.user.role

                  // remove files from s3
                  if(this.state.keys.length > 0){
                    try {
                      await deleteHandler(this.state.keys)
                    } catch (e) {
                      console.log("Error! Could not delete images from s3", e)
                    }
                  }

                  // upload new images to s3 from client to avoid burdening back end
                  if(this.state.selectedFiles.length > 0){
                    let prefix = 'users/' + this.props.user.id + '/'
                    try {
                      await uploadHandler(prefix, this.state.selectedFiles)
                    } catch (e) {
                      console.log("Error! Could not upload images to s3", e)
                    }
                  }

                  this.props.editProfile(values)
                  this.props.updateProfileContent(this.state.selectedFiles.length > 0, values.first_name, values.last_name)
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
                  <h3>Edit Profile</h3>

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

                  {(() => {
                    if(this.state.picture){
                      del = <Form.Group controlId="pictureCount">
                              <Form.Row className="justify-content-center">
                                <Form.Label><h5>Delete Profile Picture</h5></Form.Label>
                              </Form.Row>
                              <Image style={{height: "400px", width: "400px"}} fluid src={this.state.picture.url} alt={"Pic 1"} />
                              <Form.Check
                                // style={{marginLeft: 30}}
                                custom
                                className="form-custom"
                                id={this.state.picture.key}
                                label={this.state.picture.key.split('/').slice(-1)[0]}
                                onChange={event => this.deleteFileChangeHandler(event, setFieldValue)}
                              />
                            </Form.Group>
                    } 
                  })()}

                  {del}
    
                    <Form.Group controlId="picture">
                      <Form.Label><h5>Add Profile Picture</h5></Form.Label>
                      <br/>
                      <input
                        onChange={event => this.fileChangedHandler(event, setFieldValue)}
                        type="file"
                        className={touched.picture && errors.picture ? "error" : null}
                      />
                      {touched.pictureCount && errors.pictureCount ? (
                        <div className="error-message">{errors.pictureCount}</div>
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
