import React, { Component } from "react";
import { Row, Col } from "react-bootstrap";
import { Formik, Field, Form } from "formik";
import { Editor } from "@tinymce/tinymce-react";
import API from "../../../../shared/admin-axios";
import * as Yup from "yup";
import swal from "sweetalert";
import { showErrorMessage } from "../../../../shared/handle_error";
import Select from "react-select";
import Layout from "../../layout/Layout";
import LoaderSpinner from "../../Loader/loader";
import {
  htmlDecode,
  getHeightWidth,
  generateResolutionText,
  getResolution,
  FILE_VALIDATION_MASSAGE,
  FILE_SIZE,
  FILE_VALIDATION_SIZE_ERROR_MASSAGE,
  FILE_VALIDATION_TYPE_ERROR_MASSAGE,
} from "../../../../shared/helper";

class EditContent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
      TcPcDetails: "",
      banner_file: "",
      tc_pc_id: 0,
    };
  }

  componentDidMount() {
    API.get(`/api/adm/tc_pc_details/${this.props.match.params.id}`)
      .then((res) => {
        this.setState({
          TcPcDetails: res.data.data[0],
          isLoading: false,
          validationMessage: generateResolutionText("review_image"),
          fileValidationMessage: FILE_VALIDATION_MASSAGE,
          tc_pc_id: this.props.match.params.id,
        });
      })
      .catch((err) => {
        this.setState({
          isLoading: false,
        });
        showErrorMessage(err, this.props);
      });
  }
  fileChangedHandler = (event, setFieldTouched, setFieldValue, setErrors) => {
    //console.log(event.target.files);
    setFieldTouched("file");
    setFieldValue("file", event.target.value);
    const SUPPORTED_FORMATS = ["image/png", "image/jpeg", "image/jpg"];
    if (!event.target.files[0]) {
      //Supported
      this.setState({
        banner_file: "",
        isValidFile: true,
        isValidHeightWidth: true,
      });
      return;
    }
    if (
      event.target.files[0] &&
      SUPPORTED_FORMATS.includes(event.target.files[0].type)
    ) {
      this.setState({
        banner_file: event.target.files[0],
        isValidFile: true,
      });
    } else {
      setErrors({
        file: "Only files with the following extensions are allowed: png jpg jpeg",
      }); //Not working- So Added validation in "yup"
      this.setState({
        banner_file: "",
        isValidFile: false,
        isValidHeightWidth: true,
      });
    }
  };
  handleSubmitEventUpdate = (values, actions) => {
    let formData = new FormData();

    formData.append("description", values.content);
    formData.append("title", values.title);

    let url = `/api/adm/tc_pc_list/${this.state.tc_pc_id}`;
    let method = "PUT";
    // return;
    if (this.state.banner_file) {
      if (this.state.banner_file.size > FILE_SIZE) {
        actions.setErrors({ file: FILE_VALIDATION_SIZE_ERROR_MASSAGE });
        actions.setSubmitting(false);
      } else {
        getHeightWidth(this.state.banner_file).then((dimension) => {
          const { height, width } = dimension;
          const offerDimension = getResolution("review_image");
          if (
            height != offerDimension.height ||
            width != offerDimension.width
          ) {
            //    actions.setErrors({ file: "The file is not of desired height and width" });
            actions.setErrors({ file: FILE_VALIDATION_TYPE_ERROR_MASSAGE });
            actions.setSubmitting(false);
          } else {
            formData.append("file", this.state.banner_file);
            API({
              method: method,
              url: url,
              data: formData,
            })
              .then((res) => {
                this.setState({ showModal: false });
                swal({
                  closeOnClickOutside: false,
                  title: "Success",
                  text: "Updated Successfully",
                  icon: "success",
                }).then(() => {
                  this.getUserReviewList();
                });
              })
              .catch((err) => {
                this.setState({ closeModal: true, showModalLoader: false });
                if (err.data.status === 3) {
                  showErrorMessage(err, this.props);
                } else {
                  actions.setErrors(err.data.errors);
                  actions.setSubmitting(false);
                }
              });
          }
        });
      }
    } else {
      API({
        method: method,
        url: url,
        data: formData,
      })
        .then((res) => {
          this.setState({ showModal: false });
          swal({
            closeOnClickOutside: false,
            title: "Success",
            text: "Updated Successfully",
            icon: "success",
          }).then(() => {
            this.props.history.push("/tcpc");
          });
        })
        .catch((err) => {
          this.setState({ closeModal: true, showModalLoader: false });
          if (err.data.status === 3) {
            showErrorMessage(err, this.props);
          } else {
            actions.setErrors(err.data.errors);
            actions.setSubmitting(false);
          }
        });
    }
  };

  render() {
    const { TcPcDetails } = this.state;
    const initialValues = {
      title: "",
      file: "",
      content: "",
    };
    const newInitialValues = Object.assign(initialValues, {
      title: TcPcDetails != "" ? htmlDecode(TcPcDetails.title) : "",
      content: TcPcDetails != "" ? htmlDecode(TcPcDetails.description) : "",
    });
    const validateStopFlag = Yup.object().shape({
      content: Yup.string().required("Please enter the Content"),
    });

    return (
      <>
        {this.state.isLoading ? (
          <LoaderSpinner />
        ) : (
          <Layout {...this.props}>
            <div className="content-wrapper">
              <section className="content-header">
                <h1>
                  {TcPcDetails != "" ? `Edit ${TcPcDetails.title}` : ""}

                  <small />
                </h1>
                <br />

                <input
                  type="button"
                  value="Go Back"
                  className="btn btn-warning btn-sm"
                  onClick={() => {
                    window.history.go(-1);
                    return false;
                  }}
                  style={{ right: "9px", position: "absolute", top: "13px" }}
                />
              </section>
              <section className="content">
                <div className="box">
                  <div className="box-body">
                    <Formik
                      initialValues={newInitialValues}
                      validationSchema={validateStopFlag}
                      onSubmit={this.handleSubmitEventUpdate}
                    >
                      {({
                        values,
                        errors,
                        touched,
                        isValid,
                        isSubmitting,
                        setFieldValue,
                        setFieldTouched,
                        handleChange,
                        setErrors,
                      }) => {
                        return (
                          <Form>
                            <div className="contBox">
                              {/*  <Row>
                                <Col xs={12} sm={12} md={12}>
                                  <div className="form-group">
                                    <label>
                                      Upload Image
                                      {this.state.review_id > 0 ? null : (
                                        <span className="impField">*</span>
                                      )}
                                      <br />{" "}
                                      <i> {this.state.fileValidationMessage}</i>
                                      <br />{" "}
                                      <i>{this.state.validationMessage}</i>
                                    </label>
                                    <Field
                                      name="file"
                                      type="file"
                                      className={`form-control`}
                                      placeholder="Review File"
                                      autoComplete="off"
                                      id=""
                                      onChange={(e) => {
                                        this.fileChangedHandler(
                                          e,
                                          setFieldTouched,
                                          setFieldValue,
                                          setErrors
                                        );
                                      }}
                                    />
                                    {errors.file && touched.file ? (
                                      <span className="errorMsg">
                                        {errors.file}
                                      </span>
                                    ) : null}
                                  </div>
                                </Col>
                              </Row> */}
                              <Row>
                                <Col xs={12} sm={12} md={12}>
                                  <div className="form-group">
                                    <label>
                                      Content
                                      <span className="impField">*</span>
                                    </label>
                                    <input
                                      id="my-file"
                                      type="file"
                                      name="my-file"
                                      style={{ display: "none" }}
                                    />
                                    <Editor
                                      value={values.content}
                                      init={{
                                        height: 500,
                                        menubar: false,
                                        plugins: [
                                          "advlist autolink lists link image charmap print preview anchor",
                                          "searchreplace visualblocks code fullscreen",
                                          "insertdatetime media table paste code help wordcount",
                                        ],
                                        toolbar:
                                          "insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image | visualblocks code ",
                                        content_style:
                                          "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
                                        file_browser_callback_types: "image",
                                        file_picker_callback: function (
                                          callback,
                                          value,
                                          meta
                                        ) {
                                          if (meta.filetype == "image") {
                                            var input =
                                              document.getElementById(
                                                "my-file"
                                              );
                                            input.click();
                                            input.onchange = function () {
                                              var file = input.files[0];
                                              var reader = new FileReader();
                                              reader.onload = function (e) {
                                                console.log(
                                                  "name",
                                                  e.target.result
                                                );
                                                callback(e.target.result, {
                                                  alt: file.name,
                                                });
                                              };
                                              reader.readAsDataURL(file);
                                            };
                                          }
                                        },
                                        paste_data_images: true,
                                      }}
                                      onEditorChange={(value) =>
                                        setFieldValue("content", value)
                                      }
                                    />
                                  </div>
                                </Col>
                              </Row>
                            </div>
                            <button
                              className={`btn btn-success btn-sm ${
                                isValid ? "btn-custom-green" : "btn-disable"
                              } m-r-10`}
                              type="submit"
                              disabled={
                                isValid ? (isSubmitting ? true : false) : true
                              }
                            >
                              {isSubmitting ? "Updating..." : "Update"}
                            </button>
                          </Form>
                        );
                      }}
                    </Formik>
                  </div>
                </div>
              </section>
            </div>
          </Layout>
        )}
      </>
    );
  }
}
export default EditContent;
