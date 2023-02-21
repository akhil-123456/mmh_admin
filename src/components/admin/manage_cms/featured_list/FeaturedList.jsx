import React, { Component } from "react";
import { BootstrapTable, TableHeaderColumn } from "react-bootstrap-table";
import { Link } from "react-router-dom";
import { Row, Col, Modal, Tooltip, OverlayTrigger } from "react-bootstrap";
import { Formik, Field, Form } from "formik";
import API from "../../../../shared/admin-axios";
import * as Yup from "yup";
import swal from "sweetalert";
import { showErrorMessage } from "../../../../shared/handle_error";
import Switch from "react-switch";
import Layout from "../../layout/Layout";
import ReactHtmlParser from "react-html-parser";
import dateFormat from "dateformat";
import LoaderSpinner from "../../Loader/loader";
import {
  htmlDecode,
  getHeightWidth,
  generateResolutionText,
  FILE_VALIDATION_TYPE_ERROR_MASSAGE,
  getResolution,
  FILE_VALIDATION_MASSAGE,
  FILE_SIZE,
  FILE_VALIDATION_SIZE_ERROR_MASSAGE,
} from "../../../../shared/helper";
const initialValues = {
  title: "",
  file: "",
};
const __htmlDecode = (refObj) => (cell) => {
  return ReactHtmlParser(htmlDecode(cell));
};

const custStatus = (refObj) => (cell) => {
  if (cell === 1) {
    return <p style={{ color: "green" }}>Active</p>;
  } else if (cell === 0) {
    return <p style={{ color: "red" }}> Inactive</p>;
  }
};

const setDate = (refOBj) => (cell) => {
  if (cell && cell != "") {
    var mydate = new Date(cell);
    return dateFormat(mydate, "dd-mm-yyyy");
  } else {
    return "---";
  }
};
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

const actionFormatter = (refObj) => (cell, row) => {
  return (
    <div className="actionStyle">
      <LinkWithTooltip
        tooltip={"Click to change status"}
        href="#"
        id="tooltip-1"
      >
        <Switch
          checked={row.status == 1 ? true : false}
          uncheckedIcon={false}
          onChange={() => refObj.changeStatus(row.id, row.status)}
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
class FeaturedList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      FeaturedList: [],
      healthDetails: {},
      healthId: 0,
      isLoading: true,
      showModal: false,
      thumbNailModal: false,
      status: "",
      selectStatus: [
        { value: "0", label: "Inactive" },
        { value: "1", label: "Active" },
      ],
    };
  }

  getFeaturedList = () => {
    let { status } = this.state;
    API.get(`/api/adm/featured_list?&status=${encodeURIComponent(status)}`)
      .then((res) => {
        this.setState({
          FeaturedList: res.data.data,
          isLoading: false,
          healthId: 0,
        });
      })
      .catch((err) => {
        this.setState({
          isLoading: false,
        });
        showErrorMessage(err, this.props);
      });
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
        this.deleteFeaturedImage(id);
      }
    });
  };

  deleteFeaturedImage = (id) => {
    API.put(`api/adm/featured_list/${id}`)
      .then((res) => {
        swal({
          closeOnClickOutside: false,
          title: "Success",
          text: "Record deleted successfully.",
          icon: "success",
        }).then(() => {
          this.getFeaturedList();
        });
      })
      .catch((err) => {
        if (err.data.status !== 1) {
          this.setState({ closeModal: true });
          showErrorMessage(err, this.props);
        }
      });
  };

  changeStatus = (cell, status) => {
    API.put(`/api/adm/change_status_featured_image/${cell}`, {
      status: status == 1 ? String(0) : String(1),
    })
      .then((res) => {
        swal({
          closeOnClickOutside: false,
          title: "Success",
          text: "Record updated successfully.",
          icon: "success",
        }).then(() => {
          this.getFeaturedList();
        });
      })
      .catch((err) => {
        if (err.data.status === 3) {
          this.setState({ closeModal: true });
          showErrorMessage(err, this.props);
        }
      });
  };

  handleSubmitEventAdd = (values, actions) => {
    let formData = new FormData();

    formData.append("title", values.title);
    formData.append("status", values.status);
    let url = `api/adm/featured_list/`;
    let method = "POST";

    if (this.state.file.size > FILE_SIZE) {
      actions.setErrors({ file: FILE_VALIDATION_SIZE_ERROR_MASSAGE });
      actions.setSubmitting(false);
    } else {
      getHeightWidth(this.state.file).then((dimension) => {
        const { height, width } = dimension;
        const offerDimension = getResolution("featured_image");
        if (height != offerDimension.height || width != offerDimension.width) {
          actions.setErrors({ file: FILE_VALIDATION_TYPE_ERROR_MASSAGE });
          actions.setSubmitting(false);
        } else {
          formData.append("file", this.state.file);
          API({
            method: method,
            url: url,
            data: formData,
          })
            .then((res) => {
              this.setState({ showModal: false, file: "" });
              swal({
                closeOnClickOutside: false,
                title: "Success",
                text: "Added Successfully",
                icon: "success",
              }).then(() => {
                this.getFeaturedList();
              });
            })
            .catch((err) => {
              this.setState({
                closeModal: true,
                showModalLoader: false,
                file: "",
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
  };

  componentDidMount() {
    this.getFeaturedList();
    this.setState({
      validationMessage: generateResolutionText("featured_image"),
      fileValidationMessage: FILE_VALIDATION_MASSAGE,
    });
  }

  modalCloseHandler = () => {
    this.setState({ showModal: false });
  };

  modalShowHandler = (event, id) => {
    event.preventDefault();

    this.setState({ showModal: true });
  };

  imageModalShowHandler = (url) => {
    console.log(url);
    this.setState({ thumbNailModal: true, image_url: url });
  };
  imageModalCloseHandler = () => {
    this.setState({ thumbNailModal: false, image_url: "" });
  };

  fileChangedHandler = (event, setFieldTouched, setFieldValue, setErrors) => {
    //console.log(event.target.files);
    setFieldTouched("file");
    setFieldValue("file", event.target.value);
    const SUPPORTED_FORMATS = ["image/png", "image/jpeg", "image/jpg"];
    if (!event.target.files[0]) {
      //Supported
      this.setState({
        file: "",
        isValidFile: true,
      });
      return;
    }
    if (
      event.target.files[0] &&
      SUPPORTED_FORMATS.includes(event.target.files[0].type)
    ) {
      //Supported
      this.setState({
        file: event.target.files[0],
        isValidFile: true,
      });
    } else {
      //Unsupported
      setErrors({
        file: "Only files with the following extensions are allowed: png jpg jpeg",
      }); //Not working- So Added validation in "yup"
      this.setState({
        file: "",
        isValidFile: false,
      });
    }
  };

  setFeaturedImage = (refObj) => (cell, row) => {
    if (row.image_url !== null) {
      return (
        <img
          src={cell}
          alt="Featured Image"
          width="100"
          height="80"
          onClick={(e) => refObj.imageModalShowHandler(row.image_url)}
        ></img>
      );
    } else {
      return null;
    }
  };

  FeaaturedListSearch = (e) => {
    e.preventDefault();

    const status = document.getElementById("status").value;

    if (status === "") {
      return false;
    }
    API.get(`/api/adm/featured_list?&status=${encodeURIComponent(status)}`)
      .then((res) => {
        this.setState({
          FeaturedList: res.data.data,
          isLoading: false,
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

  clearSearch = () => {
    document.getElementById("status").value = "";
    this.setState(
      {
        status: "",
        remove_search: false,
      },
      () => {
        this.getFeaturedList();
      }
    );
  };
  render() {
    const validateStopFlag = Yup.object().shape({
      title: Yup.string().required("Please enter Title"),
      file: Yup.string()
        .required("Please select the Image")
        .test(
          "image",
          "Only files with the following extensions are allowed: png jpg jpeg",
          () => this.state.isValidFile
        ),
      status: Yup.string()
        .trim()
        .required("Please select status")
        .matches(/^[0|1]$/, "Invalid status selected"),
    });

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
                      Manage Featured Image (Total:
                      {this.state.FeaturedList.length})
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
                        <i className="fas fa-plus m-r-5" /> Add Featured Image
                      </button>
                    </div>

                    <form className="form">
                      <div className="">
                        <select
                          name="status"
                          id="status"
                          className="form-control"
                        >
                          <option value="">Select Status</option>
                          {this.state.selectStatus.map((val) => {
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
                          onClick={(e) => this.FeaaturedListSearch(e)}
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
                    <BootstrapTable data={this.state.FeaturedList}>
                      <TableHeaderColumn
                        isKey
                        dataField="title"
                        dataFormat={__htmlDecode(this)}
                      >
                        Title
                      </TableHeaderColumn>

                      <TableHeaderColumn
                        dataField="image_url"
                        dataFormat={this.setFeaturedImage(this)}
                      >
                        Image
                      </TableHeaderColumn>
                      <TableHeaderColumn
                        dataField="created_at"
                        dataFormat={setDate(this)}
                      >
                        Post Date
                      </TableHeaderColumn>
                      <TableHeaderColumn
                        dataField="status"
                        dataFormat={custStatus(this)}
                      >
                        Status
                      </TableHeaderColumn>

                      <TableHeaderColumn
                        dataField="id"
                        dataFormat={actionFormatter(this)}
                        dataAlign=""
                      >
                        Action
                      </TableHeaderColumn>
                    </BootstrapTable>

                    {/* ======= Add Featured image Modal ======== */}
                    <Modal
                      show={this.state.showModal}
                      onHide={() => this.modalCloseHandler()}
                      backdrop="static"
                    >
                      <Formik
                        initialValues={initialValues}
                        validationSchema={validateStopFlag}
                        onSubmit={this.handleSubmitEventAdd}
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
                                  <div className="loading_reddy"></div>
                                </div>
                              ) : (
                                ""
                              )}
                              <Modal.Header closeButton>
                                <Modal.Title>Add Featured Image</Modal.Title>
                              </Modal.Header>
                              <Modal.Body>
                                <div className="contBox">
                                  <Row>
                                    <Col xs={12} sm={12} md={12}>
                                      <div className="form-group">
                                        <label>
                                          Title
                                          <span className="impField">*</span>
                                        </label>
                                        <Field
                                          name="title"
                                          type="text"
                                          className={`form-control`}
                                          placeholder="Enter Title"
                                          autoComplete="off"
                                          value={values.title}
                                        />
                                        {errors.title && touched.title ? (
                                          <span className="errorMsg">
                                            {errors.title}
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
                                          {this.state.healthId > 0 ? null : (
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
                                          placeholder="Select Image"
                                          autoComplete="off"
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
                                          {this.state.selectStatus.map(
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
                                  {this.state.healthId > 0
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

                    {/* MODAL FOR IMAGE*/}
                    <Modal
                      show={this.state.thumbNailModal}
                      onHide={() => this.imageModalCloseHandler()}
                      backdrop="static"
                    >
                      <Modal.Header closeButton>Featured Image</Modal.Header>
                      <Modal.Body>
                        <center>
                          <div className="imgUi">
                            <img
                              src={this.state.image_url}
                              alt="Featured Image"
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
export default FeaturedList;
