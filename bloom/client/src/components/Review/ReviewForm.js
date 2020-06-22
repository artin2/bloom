import React from 'react';
import '../../App.css';
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import InputGroup from 'react-bootstrap/InputGroup'
import { FaPen } from 'react-icons/fa';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { css } from '@emotion/core'
import GridLoader from 'react-spinners/GridLoader'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { addReview } from './ReviewHelper.js'
import { Rating } from '@material-ui/lab'
import Cookies from 'js-cookie';
const override = css`
  display: block;
  margin: 0 auto;
`;
const fetchDomain = process.env.NODE_ENV === 'production' ? process.env.REACT_APP_FETCH_DOMAIN_PROD : process.env.REACT_APP_FETCH_DOMAIN_DEV;
const helper = require('../Search/helper.js');

class ReviewForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      rating: null,
      comment: '',
      selectedFiles: [],
      isLoading: this.props.loading,
      isSubmitting: false
    };

    // Schema for yup
    this.yupValidationSchema = Yup.object().shape({
      comment: Yup.string()
      .min(20, "Review must have at least 20 characters"),
      rating: Yup.number()
      .typeError('Rating is required')
      .required("Rating is required")
    });
  }

  triggerUserAppointments(){
    this.props.history.push({
      pathname: '/users/'+ JSON.parse(Cookies.get('user').substring(2)).id +'/appointments'
    })
  }

  // redirect to the worker display page
  async componentDidUpdate(prevProps, prevState)  {
    if (prevProps.review !== this.props.review) {
      this.triggerUserAppointments()
    }
  }

  render() {
    return (
      <Container fluid>
        <Row className="justify-content-center my-5">
          <Col xs={12} lg={5}>
            <Formik
              initialValues={{
                comment: '',
                rating: null
              }}
              validationSchema={this.yupValidationSchema}
              onSubmit={async (values, actions) => {
                let store_id = this.props.match.params.store_id
                values.store_id = store_id
                values.email = JSON.parse(Cookies.get('user').substring(2)).email
                console.log("values are:", values)

                this.props.addReview(store_id, values)
                actions.setSubmitting(false)
              }}
            >
            {( {values,
                errors,
                touched,
                handleChange,
                handleBlur,
                handleSubmit,
                setFieldValue,
                setFieldTouched,
                isSubmitting}) => (
              <Form className="formBody rounded p-2 py-4 p-lg-5">
                <h3>Your Review</h3>

                <Form.Group controlId="formRating">
                  <Rating
                    name={"rating"}
                    value={values.rating}
                    onChange={(event, newValue) => {
                      setFieldValue("rating", newValue);
                      // setTouched("rating", true, false)
                      // setValue({rating: newValue});
                      setFieldTouched('rating', true, false);
                    }}
                    onBlur={handleBlur}
                  />
                  {touched.rating && errors.rating ? (
                    <div className="error-message">{errors.rating}</div>
                  ): null}
                </Form.Group>

                <Form.Group controlId="formComment">
                  <InputGroup>
                    <InputGroup.Prepend>
                        <InputGroup.Text>
                          <FaPen/>
                        </InputGroup.Text>
                    </InputGroup.Prepend>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={values.comment}
                      placeholder="E.g. Amazing service, friendly staff :)"
                      name="comment"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={touched.comment && errors.comment ? "error" : null}/>
                  </InputGroup>
                  {touched.comment && errors.comment ? (
                    <div className="error-message">{errors.comment}</div>
                  ): null}
                </Form.Group>
                {console.log(isSubmitting, (Object.keys(errors).length === 0 && errors.constructor === Object && (Object.keys(touched).length === 0 && touched.constructor === Object)), !(Object.keys(errors).length === 0 && errors.constructor === Object) )}
                {console.log(errors, touched)}
                {console.log(values.rating)}
                <Button disabled={isSubmitting || (Object.keys(errors).length === 0 && errors.constructor === Object && (Object.keys(touched).length === 0 && touched.constructor === Object)) || !(Object.keys(errors).length === 0 && errors.constructor === Object)} style={{backgroundColor: '#8CAFCB', border: '0px'}} onClick={handleSubmit}>Submit</Button>
              </Form>
            )}
            </Formik>
          </Col>
        </Row>
      </Container>
    );
  }
}

const mapDispatchToProps = dispatch => bindActionCreators({
  addReview: (store_id, values) => addReview(store_id, values),
}, dispatch)

const mapStateToProps = state => ({
  review: state.reviewReducer.review,
})

export default connect(mapStateToProps, mapDispatchToProps)(ReviewForm);
