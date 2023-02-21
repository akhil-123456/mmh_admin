import React, { Component } from "react";
import { BootstrapTable, TableHeaderColumn } from "react-bootstrap-table";
import { Row, Col, Tooltip, OverlayTrigger, Modal } from "react-bootstrap";
import { Link } from "react-router-dom";
import API from "../../../../shared/admin-axios";
import { Formik, Field, Form } from "formik"; // for add/edit only
import * as Yup from "yup"; // for add/edit only
import swal from "sweetalert";
import { Editor } from "@tinymce/tinymce-react";
import LoaderSpinner from "../../Loader/loader";

import Layout from "../../layout/Layout";
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
import whitelogo from "../../../../assets/images/drreddylogo_white.png";
import Switch from "react-switch";

import { showErrorMessage } from "../../../../shared/handle_error";
import dateFormat from "dateformat";

/*For Tooltip*/

function LinkWithTooltip({ id, children, href, tooltip, clicked }) {
  return (
    <OverlayTrigger
      overlay={<Tooltip id={id}>{tooltip}</Tooltip>}
      placement="left"
      delayShow={300}
      delayHide={150}
      trigger={["hover"]}
    >
      <Link to={href} onClick={clicked}>
        {children}
      </Link>
    </OverlayTrigger>
  );
}
/*For Tooltip*/

const actionFormatter = (refObj) => (cell, row) => {
  return (
    <div className="actionStyle">
      <LinkWithTooltip
        tooltip={"Click to Edit"}
        clicked={(e) => refObj.modalShowHandler(e, cell, row)}
        href="#"
        id="tooltip-1"
      >
        <i className="far fa-edit" />
      </LinkWithTooltip>
      <LinkWithTooltip
        tooltip={"Click to change status"}
        // clicked={(e) => refObj.chageStatus(e, cell, row.status)}
        href="#"
        id="tooltip-1"
      >
        <Switch
          checked={row.status == 1 ? true : false}
          uncheckedIcon={false}
          onChange={(e) => refObj.chageStatus(cell, row.status)}
          height={20}
          width={45}
        />
      </LinkWithTooltip>
      <LinkWithTooltip
        tooltip="Click to Delete"
        href="#"
        clicked={(e) => refObj.confirmDelete(e, cell)}
        id="tooltip-1"
      >
        <i className="far fa-trash-alt" />
      </LinkWithTooltip>
    </div>
  );
};

const __htmlDecode = (refObj) => (cell) => {
  return htmlDecode(cell);
};

const __htmlDecodeDescription = (refObj) => (cell) => {
  if (cell.length > 100) {
    return htmlDecode(cell.substring(0, 100).concat("...."));
  } else {
    return htmlDecode(cell);
  }
};

const reviewStatus = (refObj) => (cell) => {
  if (cell === 1) {
    return <p style={{ color: "green" }}>Active</p>;
  } else if (cell === 0) {
    return <p style={{ color: "red" }}> Inactive</p>;
  }
};

const setReviewImage = (refObj) => (cell, row) => {
  return (
    <img
      src={row.image_url}
      alt="Review Image"
      height="100"
      onClick={(e) => refObj.imageModalShowHandler(row.image_url)}
    ></img>
  );
};

const setDate = (refOBj) => (cell) => {
  if (cell && cell != "") {
    var mydate = new Date(cell);
    return dateFormat(mydate, "dd-mm-yyyy");
  } else {
    return "---";
  }
};

const initialValues = {
  file: "",
  name: "",
  designation: "",
  review: "",
  status: "",
};

class Review extends Component {
  constructor(props) {
    super(props);
    this.state = {
      review: [],
      isLoading: true,
      review_file: "",
      showModal: false,
      search_text: "",
      status: "",
      review_id: 0,
      reviewDetails: [],
      status_banners: [
        { value: "1", label: "Active" },
        { value: "0", label: "Inactive" },
      ],
      thumbNailModal: false,
      message: "",
    };
  }

  componentDidMount() {
    this.getUserReviewList();
    this.setState({
      validationMessage: generateResolutionText("review_image"),
      fileValidationMessage: FILE_VALIDATION_MASSAGE,
    });
  }

  getUserReviewList = () => {
    let search_text = this.state.search_text;
    let status = this.state.status;

    API.get(
      `/api/adm/user_feedback?status=${encodeURIComponent(
        status
      )}&search_text=${encodeURIComponent(search_text)}`
    )
      .then((res) => {
        this.setState({
          review: res.data.data,
          isLoading: false,
        });
      })
      .catch((err) => {
        this.setState({
          isLoading: false,
        });
        showErrorMessage(err, this.props);
      });
  };

  reviewSearch = (e) => {
    e.preventDefault();
    var search_text = document.getElementById("search_text").value;
    var status = document.getElementById("status").value;
    if (search_text === "" && status === "") {
      return false;
    }

    API.get(
      `/api/adm/user_feedback?status=${encodeURIComponent(
        status
      )}&search_text=${encodeURIComponent(search_text)}`
    )
      .then((res) => {
        this.setState({
          review: res.data.data,
          isLoading: false,
          search_text: search_text,
          status: status,
          remove_search: true,
        });
      })
      .catch((err) => {
        this.setState({
          isLoading: false,
        });
        showErrorMessage(err, this.props);
      });
  };

  modalCloseHandler = () => {
    this.setState({
      showModal: false,
      reviewDetails: "",
      review_id: 0,
      review_file: "",
      message: "",
      fileValidationMessage: "",
    });
  };

  modalShowHandler = (event, id, row) => {
    this.setState({ fileValidationMessage: FILE_VALIDATION_MASSAGE });
    if (id) {
      event.preventDefault();
      this.setState({ showModal: true, reviewDetails: row, review_id: id });
    } else {
      this.setState({ showModal: true, id: 0, reviewDetails: {} });
    }
  };

  handleAddSubmitEvent = async (values, actions) => {
    var formData = new FormData();
    formData.append("name", values.name);
    formData.append("designation", values.designation);
    formData.append("review", values.review);
    formData.append("status", values.status);

    let url = `api/adm/user_feedback/`;
    let method = "POST";

    if (this.state.review_file) {
      if (this.state.review_file.size > FILE_SIZE) {
        actions.setErrors({ file: FILE_VALIDATION_SIZE_ERROR_MASSAGE });
        actions.setSubmitting(false);
      } else {
        getHeightWidth(this.state.review_file).then((dimension) => {
          const { height, width } = dimension;
          const offerDimension = getResolution("review_image");
          if (
            height != offerDimension.height ||
            width != offerDimension.width
          ) {
            actions.setErrors({ file: FILE_VALIDATION_TYPE_ERROR_MASSAGE });
            actions.setSubmitting(false);
          } else {
            formData.append("file", this.state.review_file);
            API({
              method: method,
              url: url,
              data: formData,
            })
              .then((res) => {
                this.setState({ showModal: false, review_file: "" });
                swal({
                  closeOnClickOutside: false,
                  title: "Success",
                  text: "Added Successfully",
                  icon: "success",
                }).then(() => {
                  this.getUserReviewList();
                });
              })
              .catch((err) => {
                this.setState({
                  closeModal: true,
                  showModalLoader: false,
                  review_file: "",
                });
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
    }
  };
  handleSubmitEventUpdate = (values, actions) => {
    let formData = new FormData();

    formData.append("name", values.name);
    formData.append("designation", values.designation);
    formData.append("review", values.review);
    formData.append("status", values.status);

    let url = `/api/adm/update_user_feedback/${this.state.review_id}`;
    let method = "PUT";
    // return;
    if (this.state.review_file) {
      if (this.state.review_file.size > FILE_SIZE) {
        actions.setErrors({ file: FILE_VALIDATION_SIZE_ERROR_MASSAGE });
        actions.setSubmitting(false);
      } else {
        getHeightWidth(this.state.review_file).then((dimension) => {
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
            formData.append("file", this.state.review_file);
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
  };

  confirmDelete = (event, id) => {
    event.preventDefault();
    swal({
      closeOnClickOutside: false,
      title: "Are you sure?",
      text: "Once deleted, you will not be able to recover this!",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then((willDelete) => {
      if (willDelete) {
        this.deleteuserReview(id);
      }
    });
  };

  deleteuserReview = (id) => {
    API.put(`/api/adm/user_feedback/${id}`)
      .then((res) => {
        swal({
          closeOnClickOutside: false,
          title: "Success",
          text: "Record deleted successfully.",
          icon: "success",
        }).then(() => {
          this.getUserReviewList(this.state.activePage);
        });
      })
      .catch((err) => {
        if (err.data.status === 3) {
          this.setState({ closeModal: true });
          showErrorMessage(err, this.props);
        }
      });
  };

  chageStatus = (cell, status) => {
    API.put(`/api/adm/change_status_review/${cell}`, {
      status: status == 1 ? String(0) : String(1),
    })
      .then((res) => {
        swal({
          closeOnClickOutside: false,
          title: "Success",
          text: "Record updated successfully.",
          icon: "success",
        }).then(() => {
          this.getUserReviewList(this.state.activePage);
        });
      })
      .catch((err) => {
        if (err.data.status === 3) {
          this.setState({ closeModal: true });
          showErrorMessage(err, this.props);
        }
      });
  };

  clearSearch = () => {
    document.getElementById("status").value = "";
    document.getElementById("search_text").value = "";

    this.setState(
      {
        status: "",
        search_text: "",
        remove_search: false,
      },
      () => {
        this.setState({ activePage: 1 });
        this.getUserReviewList();
      }
    );
  };

  checkHandler = (event) => {
    event.preventDefault();
  };

  imageModalShowHandler = (url) => {
    console.log(url);
    this.setState({ thumbNailModal: true, user_url: url });
  };
  imageModalCloseHandler = () => {
    this.setState({ thumbNailModal: false, user_url: "" });
  };

  fileChangedHandler = (event, setFieldTouched, setFieldValue, setErrors) => {
    //console.log(event.target.files);
    setFieldTouched("file");
    setFieldValue("file", event.target.value);
    console.log(event.target.files);
    const SUPPORTED_FORMATS = ["image/png", "image/jpeg", "image/jpg"];
    if (!event.target.files[0]) {
      //Supported
      this.setState({
        review_file: "",
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
        review_file: event.target.files[0],
        isValidFile: true,
      });
    } else {
      setErrors({
        review_file:
          "Only files with the following extensions are allowed: png jpg jpeg",
      }); //Not working- So Added validation in "yup"
      this.setState({
        review_file: "",
        isValidFile: false,
        isValidHeightWidth: true,
      });
    }
  };

  render() {
    const { reviewDetails } = this.state;
    const newInitialValues = Object.assign(initialValues, {
      review_file: "",
      name: reviewDetails.name ? htmlDecode(reviewDetails.name) : "",

      review: reviewDetails.review ? htmlDecode(reviewDetails.review) : "",
      designation: reviewDetails.designation
        ? htmlDecode(reviewDetails.designation)
        : "",

      status:
        reviewDetails.status || reviewDetails.status === 0
          ? reviewDetails.status.toString()
          : "",
    });

    let validateStopFlag = {};

    if (this.state.review_id > 0) {
      validateStopFlag = Yup.object().shape({
        name: Yup.string().required("Please enter name"),
        designation: Yup.string().required("Please enter designation"),
        file: Yup.string()
          .notRequired()
          .test(
            "reviewimage",
            "Only files with the following extensions are allowed: png jpg jpeg",
            (file) => {
              if (file) {
                return this.state.isValidFile;
              } else {
                return true;
              }
            }
          ),
        review: Yup.string().required("Please enter review"),
        status: Yup.string()
          .trim()
          .required("Please select status")
          .matches(/^[0|1]$/, "Invalid status selected"),
      });
    } else {
      validateStopFlag = Yup.object().shape({
        name: Yup.string().required("Please enter name"),
        designation: Yup.string().required("Please enter designation"),
        file: Yup.mixed()
          .required("Please select the image")
          .test(
            "reviewimage",
            "Only files with the following extensions are allowed: png jpg jpeg",
            () => this.state.isValidFile
          ),

        review: Yup.string().required("Please enter review"),
        status: Yup.string()
          .trim()
          .required("Please select status")
          .matches(/^[0|1]$/, "Invalid status selected"),
      });
    }

    return (
      <>
        {this.state.isLoading ? (
          <LoaderSpinner />
        ) : (
          <Layout {...this.props}>
            <div className="content-wrapper">
              <section className="content-header">
                <div className="row">
                  <div className="col-lg-12 col-sm-12 col-xs-12">
                    <h1>
                      Manage User Review (Total:{this.state.review.length})
                      <small />
                    </h1>
                  </div>

                  <div className="col-lg-12 col-sm-12 col-xs-12  topSearchSection">
                    <div className="">
                      <button
                        type="button"
                        className="btn btn-info btn-sm"
                        onClick={(e) => this.modalShowHandler(e, "")}
                      >
                        <i className="fas fa-plus m-r-5" /> Add Review
                      </button>
                    </div>
                    <form className="form">
                      <div className="">
                        <input
                          className="form-control"
                          name="search_text"
                          id="search_text"
                          placeholder="Filter by Review Name"
                        />
                      </div>

                      <div className="">
                        <select
                          name="status"
                          id="status"
                          className="form-control"
                        >
                          <option value="">Select Review Status</option>
                          {this.state.status_banners.map((val) => {
                            return (
                              <option key={val.value} value={val.value}>
                                {val.label}
                              </option>
                            );
                          })}
                        </select>
                      </div>

                      <div className="">
                        <input
                          type="submit"
                          value="Search"
                          className="btn btn-warning btn-sm"
                          onClick={(e) => this.reviewSearch(e)}
                        />
                        {this.state.remove_search ? (
                          <a
                            onClick={() => this.clearSearch()}
                            className="btn btn-danger btn-sm"
                          >
                            {" "}
                            Remove{" "}
                          </a>
                        ) : null}
                      </div>
                      <div className="clearfix"></div>
                    </form>
                  </div>
                </div>
              </section>
              <section className="content">
                <div className="box">
                  <div className="box-body">
                    <BootstrapTable
                      wrapperClasses="table-responsive"
                      data={this.state.review}
                    >
                      <TableHeaderColumn
                        isKey
                        dataField="name"
                        dataFormat={__htmlDecode(this)}
                        tdStyle={{ wordBreak: "break-word" }}
                      >
                        Name
                      </TableHeaderColumn>
                      <TableHeaderColumn
                        dataField="designation"
                        dataFormat={__htmlDecode(this)}
                        tdStyle={{ wordBreak: "break-word" }}
                      >
                        Designation
                      </TableHeaderColumn>
                      <TableHeaderColumn
                        dataField="review"
                        dataFormat={__htmlDecodeDescription(this)}
                        tdStyle={{ wordBreak: "break-word" }}
                      >
                        Review
                      </TableHeaderColumn>

                      <TableHeaderColumn
                        dataField="image_url"
                        dataFormat={setReviewImage(this)}
                        tdStyle={{ wordBreak: "break-word" }}
                      >
                        Image
                      </TableHeaderColumn>

                      <TableHeaderColumn
                        dataField="created_at"
                        dataFormat={setDate(this)}
                        tdStyle={{ wordBreak: "break-word" }}
                      >
                        Post Date
                      </TableHeaderColumn>
                      <TableHeaderColumn
                        dataField="status"
                        dataFormat={reviewStatus(this)}
                        tdStyle={{ wordBreak: "break-word" }}
                      >
                        Status
                      </TableHeaderColumn>

                      <TableHeaderColumn
                        dataField="id"
                        dataFormat={actionFormatter(this)}
                        dataAlign=""
                        width="125"
                        tdStyle={{ wordBreak: "break-word" }}
                      >
                        Action
                      </TableHeaderColumn>
                    </BootstrapTable>

                    {/* ======= Add Review Modal ======== */}
                    <Modal
                      show={this.state.showModal}
                      onHide={() => this.modalCloseHandler()}
                      backdrop="static"
                    >
                      <Formik
                        initialValues={newInitialValues}
                        validationSchema={validateStopFlag}
                        onSubmit={
                          this.state.review_id > 0
                            ? this.handleSubmitEventUpdate
                            : this.handleAddSubmitEvent
                        }
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
                              {this.state.showModalLoader === true ? (
                                <div className="loading_reddy_outer">
                                  <div className="loading_reddy">
                                    <img src={whitelogo} alt="loader" />
                                  </div>
                                </div>
                              ) : (
                                ""
                              )}
                              <Modal.Header closeButton>
                                <Modal.Title>
                                  {this.state.review_id == 0
                                    ? "Add User"
                                    : "Edit User"}{" "}
                                  Review
                                </Modal.Title>
                              </Modal.Header>
                              <Modal.Body>
                                <div className="contBox">
                                  <Row>
                                    <Col xs={12} sm={12} md={12}>
                                      <div className="form-group">
                                        <label>
                                          User Name{" "}
                                          <span className="impField">*</span>
                                        </label>
                                        <Field
                                          name="name"
                                          type="text"
                                          className={`form-control`}
                                          placeholder="Enter user name"
                                          autoComplete="off"
                                          value={values.name}
                                        />
                                        {errors.name && touched.name ? (
                                          <span className="errorMsg">
                                            {errors.name}
                                          </span>
                                        ) : null}
                                      </div>
                                    </Col>
                                  </Row>
                                  <Row>
                                    <Col xs={12} sm={12} md={12}>
                                      <div className="form-group">
                                        <label>
                                          Designation{" "}
                                          <span className="impField">*</span>
                                        </label>
                                        <Field
                                          name="designation"
                                          type="text"
                                          className={`form-control`}
                                          placeholder="Enter user's designation"
                                          autoComplete="off"
                                          value={values.designation}
                                        />
                                        {errors.designation &&
                                        touched.designation ? (
                                          <span className="errorMsg">
                                            {errors.designation}
                                          </span>
                                        ) : null}
                                      </div>
                                    </Col>
                                  </Row>
                                  <Row>
                                    <Col xs={12} sm={12} md={12}>
                                      <div className="form-group">
                                        <label>
                                          Review{" "}
                                          <span className="impField">*</span>
                                        </label>
                                        <Editor
                                          placeholder="Enter review"
                                          value={values.review}
                                          init={{
                                            height: 200,
                                            menubar: false,
                                            plugins: [
                                              "advlist autolink lists link charmap print preview anchor",
                                              "searchreplace visualblocks code fullscreen",
                                              "insertdatetime = table paste code help wordcount",
                                            ],
                                            toolbar:
                                              "insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | visualblocks code ",
                                            content_style:
                                              "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",

                                            paste_data_images: false,
                                          }}
                                          onEditorChange={(value) =>
                                            setFieldValue("review", value)
                                          }
                                        />
                                        {errors.review && touched.review ? (
                                          <span className="errorMsg">
                                            {errors.review}
                                          </span>
                                        ) : null}
                                      </div>
                                    </Col>
                                  </Row>

                                  <Row>
                                    <Col xs={12} sm={12} md={12}>
                                      <div className="form-group">
                                        <label>
                                          Upload Image
                                          {this.state.review_id > 0 ? null : (
                                            <span className="impField">*</span>
                                          )}
                                          <br />{" "}
                                          <i>
                                            {" "}
                                            {this.state.fileValidationMessage}
                                          </i>
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
                                  </Row>
                                  <Row>
                                    <Col xs={12} sm={12} md={12}>
                                      <div className="form-group">
                                        <label>
                                          Status
                                          <span className="impField">*</span>
                                        </label>
                                        <Field
                                          name="status"
                                          component="select"
                                          className={`selectArowGray form-control`}
                                          autoComplete="off"
                                          value={values.status}
                                        >
                                          <option key="-1" value="">
                                            Select
                                          </option>
                                          {this.state.status_banners.map(
                                            (val, i) => (
                                              <option key={i} value={val.value}>
                                                {val.label}
                                              </option>
                                            )
                                          )}
                                        </Field>
                                        {errors.status && touched.status ? (
                                          <span className="errorMsg">
                                            {errors.status}
                                          </span>
                                        ) : null}
                                      </div>
                                    </Col>
                                  </Row>
                                </div>
                              </Modal.Body>
                              <Modal.Footer>
                                <button
                                  className={`btn btn-success btn-sm ${
                                    isValid ? "btn-custom-green" : "btn-disable"
                                  } m-r-10`}
                                  type="submit"
                                  disabled={
                                    isValid
                                      ? isSubmitting
                                        ? true
                                        : false
                                      : true
                                  }
                                >
                                  {this.state.review_id > 0
                                    ? isSubmitting
                                      ? "Updating..."
                                      : "Update"
                                    : isSubmitting
                                    ? "Submitting..."
                                    : "Submit"}
                                </button>
                                <button
                                  onClick={(e) => this.modalCloseHandler()}
                                  className={`btn btn-danger btn-sm`}
                                  type="button"
                                >
                                  Close
                                </button>
                              </Modal.Footer>
                            </Form>
                          );
                        }}
                      </Formik>
                    </Modal>
                    <Modal
                      show={this.state.thumbNailModal}
                      onHide={() => this.imageModalCloseHandler()}
                      backdrop="static"
                    >
                      <Modal.Header closeButton>User Image</Modal.Header>
                      <Modal.Body>
                        <center>
                          <div className="imgUi">
                            <img
                              src={this.state.user_url}
                              alt="User Image"
                            ></img>
                          </div>
                        </center>
                      </Modal.Body>
                    </Modal>
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
export default Review;
