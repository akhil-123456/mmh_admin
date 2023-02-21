import React, { Component } from "react";
import { BootstrapTable, TableHeaderColumn } from "react-bootstrap-table";
import { Row, Col, Tooltip, OverlayTrigger, Modal } from "react-bootstrap";
import { Link } from "react-router-dom";
import API from "../../../shared/admin-axios";
import { Formik, Field, Form } from "formik"; // for add/edit only
import * as Yup from "yup"; // for add/edit only
import swal from "sweetalert";
import Layout from "../layout/Layout";
import {
  htmlDecode,
  generateResolutionText,
  FILE_VALIDATION_MASSAGE,
} from "../../../shared/helper";
import whitelogo from "../../../assets/images/drreddylogo_white.png";
import { Editor } from "@tinymce/tinymce-react";
import moment from "moment";

import Pagination from "react-js-pagination";
import { showErrorMessage } from "../../../shared/handle_error";
import dateFormat from "dateformat";
import LoaderSpinner from "../Loader/loader";
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
      {row.status == 1 ? (
        <LinkWithTooltip
          tooltip="Click to reply"
          href="#"
          clicked={(e) => refObj.modalShowHandler(e, cell, row)}
          id="tooltip-1"
        >
          <i className="far fa-edit" />
        </LinkWithTooltip>
      ) : (
        <LinkWithTooltip
          tooltip="Click to view"
          href="#"
          clicked={(e) => refObj.modalShowHandler(e, cell, row)}
          id="tooltip-1"
        >
          <i className="far fa-eye" />
        </LinkWithTooltip>
      )}

      <LinkWithTooltip
        tooltip="Click to delete"
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

const queryStatus = (refObj) => (cell) => {
  if (cell === 1) {
    return <p style={{ color: "red" }}>Not Replied</p>;
  } else if (cell === 0) {
    return <p style={{ color: "green" }}> Replied</p>;
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

const initialValues = {
  name: "",
  email: "",
  phone_no: "",
  description: "",
  reply_message: "",
};

class queries extends Component {
  constructor(props) {
    super(props);
    this.state = {
      queries: [],
      testimonialDetails: {},
      isLoading: true,
      showModal: false,
      page_name: "",
      activePage: 1,
      totalCount: 0,
      itemPerPage: 20,
      thumbNailModal: false,
      showModalLoader: false,
      selectStatus: [
        { value: "0", label: "Replied" },
        { value: "1", label: "Not Replied" },
      ],
      thumbNailModal: false,
      search_text: "",
      status: "",
    };
  }

  componentDidMount() {
    this.getQueriesList();
    this.setState({
      todayDate: moment(new Date()).format("YYYY-MM-DD"),
    });
  }

  handlePageChange = (pageNumber) => {
    this.setState({ activePage: pageNumber });
    this.getQueriesList(pageNumber > 0 ? pageNumber : 1);
  };

  getQueriesList = (page = 1) => {
    let search_text = this.state.search_text;
    let status = this.state.status;

    API.get(
      `/api/adm/contact_us?page=${page}&search_text=${encodeURIComponent(
        search_text
      )}&status=${encodeURIComponent(status)}`
    )
      .then((res) => {
        this.setState({
          queries: res.data.data,
          totalCount: res.data.count,
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

  querySearch = (e) => {
    e.preventDefault();

    const search_text = document.getElementById("search_text").value;
    const status = document.getElementById("status").value;
    const startDate = document.getElementById("startDate").value;
    const endDate = document.getElementById("endDate").value;

    if (startDate != "" && endDate != "") {
      if (startDate > endDate) {
        swal({
          title: "Alert!",
          text: "Invalid date range",
          icon: "warning",
        });
        this.setState({
          remove_search: true,
        });
        return false;
      }
    }

    if (
      search_text === "" &&
      status === "" &&
      endDate === "" &&
      startDate === ""
    ) {
      return false;
    }

    API.get(
      `/api/adm/contact_us?page=1&search_text=${encodeURIComponent(
        search_text
      )}&status=${encodeURIComponent(status)}&start_date=${encodeURIComponent(
        startDate
      )}&end_date=${encodeURIComponent(endDate)}`
    )
      .then((res) => {
        this.setState({
          queries: res.data.data,
          totalCount: res.data.count,
          isLoading: false,
          search_text: search_text,
          activePage: 1,
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
    document.getElementById("search_text").value = "";
    document.getElementById("status").value = "";
    document.getElementById("startDate").value = "";
    document.getElementById("endDate").value = "";

    this.setState(
      {
        search_text: "",
        status: "",
        remove_search: false,
      },
      () => {
        this.setState({ activePage: 1 });
        this.getQueriesList();
      }
    );
  };

  getIndivudalQueryId(id, row) {
    this.setState({
      testimonialDetails: row,
    });
  }

  modalCloseHandler = () => {
    this.setState({ banner_id: 0 });
    this.setState({ showModal: false });
    this.setState({
      testimonial_id: 0,
      testimonialDetails: {},
      image: "",
      validationMessage: "",
    });
  };

  modalShowHandler = (event, id, row) => {
    this.setState({
      validationMessage: generateResolutionText("testimonial-images"),
      fileValidationMessage: FILE_VALIDATION_MASSAGE,
    });
    if (id) {
      event.preventDefault();
      this.setState({ testimonial_id: id });
      this.getIndivudalQueryId(id, row);
      this.setState({ showModal: true });
    } else {
      this.setState({
        showModal: true,
        testimonial_id: 0,
        testimonialDetails: {},
        image: "",
      });
    }
  };

  handleSubmitEvent = (values, actions) => {
    const post_data = {
      email: values.email,
      reply_message: values.reply_message,
    };

    API({
      url: `/api/adm/reply_query/${this.state.testimonial_id}`,
      method: "POST",
      data: post_data,
    })
      .then((res) => {
        this.setState({ showModal: false });
        swal({
          closeOnClickOutside: false,
          title: "Success",
          text: "Succesfully replied to the user",
          icon: "success",
        }).then(() => {
          this.getQueriesList();
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
        this.deleteQuery(id);
      }
    });
  };

  deleteQuery = (id) => {
    API.put(`/api/adm/contact_us/${id}`)
      .then((res) => {
        swal({
          closeOnClickOutside: false,
          title: "Success",
          text: "Record deleted successfully.",
          icon: "success",
        }).then(() => {
          this.getQueriesList(this.state.activePage);
        });
      })
      .catch((err) => {
        // showErrorMessage(err, this.props);

        if (err.data.status !== 1) {
          this.setState({ closeModal: true });
          showErrorMessage(err, this.props);
        }
      });
  };

  render() {
    const { testimonialDetails, totalCount } = this.state;
    const newInitialValues = Object.assign(initialValues, {
      name: testimonialDetails.name ? htmlDecode(testimonialDetails.name) : "",
      email: testimonialDetails.email
        ? htmlDecode(testimonialDetails.email)
        : "",
      phone_no: testimonialDetails.phone_no
        ? htmlDecode(testimonialDetails.phone_no)
        : "",
      description: testimonialDetails.description
        ? htmlDecode(testimonialDetails.description)
        : "",

      reply_message: testimonialDetails.replied_msg
        ? htmlDecode(testimonialDetails.replied_msg)
        : "",
    });

    let validateStopFlag = {};

    if (this.state.testimonial_id > 0) {
      validateStopFlag = Yup.object().shape({
        name: Yup.string().required("Please enter the name"),
        reply_message: Yup.string().required("Please enter the reply"),
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
                      Manage User Queries (Total:{totalCount})
                      <small />
                    </h1>
                  </div>

                  <div className="col-lg-12 col-sm-12 col-xs-12  topSearchSection">
                    <form className="form">
                      <label>Start Date</label> &nbsp;&nbsp;
                      <div className="">
                        <input
                          className="form-control"
                          type="date"
                          name="startDate"
                          id="startDate"
                          max={this.state.todayDate}
                        />
                      </div>{" "}
                      &nbsp;&nbsp;
                      <label>End Date</label> &nbsp;&nbsp;
                      <div className="">
                        <input
                          className="form-control"
                          type="date"
                          name="endDate"
                          id="endDate"
                          max={this.state.todayDate}
                        />
                      </div>
                      <div className="">
                        <input
                          className="form-control"
                          name="search_text"
                          id="search_text"
                          placeholder="Search"
                        />
                      </div>
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
                          onClick={(e) => this.querySearch(e)}
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
                    <BootstrapTable data={this.state.queries}>
                      <TableHeaderColumn
                        isKey
                        dataField="name"
                        dataFormat={__htmlDecode(this)}
                      >
                        Name
                      </TableHeaderColumn>
                      <TableHeaderColumn
                        dataField="phone_no"
                        dataFormat={__htmlDecode(this)}
                      >
                        Phone No
                      </TableHeaderColumn>
                      <TableHeaderColumn
                        dataField="email"
                        dataFormat={__htmlDecode(this)}
                      >
                        Email
                      </TableHeaderColumn>
                      <TableHeaderColumn
                        dataField="description"
                        dataFormat={__htmlDecode(this)}
                      >
                        Description
                      </TableHeaderColumn>
                      {/*     <TableHeaderColumn
                        dataField="replied_msg"
                        dataFormat={__htmlDecode(this)}
                      >
                        Replied Message
                      </TableHeaderColumn> */}

                      <TableHeaderColumn
                        dataField="created_at"
                        dataFormat={setDate(this)}
                      >
                        Post Date
                      </TableHeaderColumn>

                      <TableHeaderColumn
                        dataField="updated_at"
                        dataFormat={setDate(this)}
                      >
                        Replied On
                      </TableHeaderColumn>

                      <TableHeaderColumn
                        dataField="status"
                        dataFormat={queryStatus(this)}
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

                    {totalCount > 20 ? (
                      <Row>
                        <Col md={12}>
                          <div className="paginationOuter text-right">
                            <Pagination
                              activePage={this.state.activePage}
                              itemsCountPerPage={20}
                              totalItemsCount={totalCount}
                              itemClass="nav-item"
                              linkClass="nav-link"
                              activeClass="active"
                              onChange={this.handlePageChange}
                            />
                          </div>
                        </Col>
                      </Row>
                    ) : null}

                    {/* ======= Send or View Reply ======== */}
                    <Modal
                      show={this.state.showModal}
                      onHide={() => this.modalCloseHandler()}
                      backdrop="static"
                    >
                      <Formik
                        initialValues={newInitialValues}
                        validationSchema={validateStopFlag}
                        onSubmit={this.handleSubmitEvent}
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
                                {testimonialDetails.status == 1 ? (
                                  <Modal.Title>Send Reply</Modal.Title>
                                ) : (
                                  <Modal.Title>View Reply</Modal.Title>
                                )}
                              </Modal.Header>
                              <Modal.Body>
                                <div className="contBox">
                                  <Row>
                                    <Col xs={12} sm={12} md={12}>
                                      <div className="form-group">
                                        <label>Name</label>
                                        <Field
                                          name="name"
                                          type="text"
                                          className={`form-control`}
                                          placeholder="Enter name"
                                          autoComplete="off"
                                          value={values.name}
                                          disabled
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
                                    <Col xs={6} sm={6} md={6}>
                                      <div className="form-group">
                                        <label>Email</label>
                                        <Field
                                          name="name"
                                          type="text"
                                          className={`form-control`}
                                          placeholder="Enter name"
                                          autoComplete="off"
                                          value={values.email}
                                          disabled
                                        />
                                        {errors.name && touched.name ? (
                                          <span className="errorMsg">
                                            {errors.name}
                                          </span>
                                        ) : null}
                                      </div>
                                    </Col>
                                    <Col xs={6} sm={6} md={6}>
                                      <div className="form-group">
                                        <label>Phone No</label>
                                        <Field
                                          name="name"
                                          type="text"
                                          className={`form-control`}
                                          placeholder="Enter name"
                                          autoComplete="off"
                                          value={values.phone_no}
                                          disabled
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
                                        <label>Description</label>
                                        <Field
                                          name="name"
                                          // type="text"
                                          as="textarea"
                                          component="textarea"
                                          className={`form-control`}
                                          placeholder="Enter name"
                                          autoComplete="off"
                                          value={values.description}
                                          style={{ height: "100px" }}
                                          disabled
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
                                        {testimonialDetails.status == 1 ? (
                                          <label>Reply Message</label>
                                        ) : (
                                          <label>Replied Message</label>
                                        )}
                                        {testimonialDetails.status == 1 ? (
                                          <Editor
                                            value={values.reply_message}
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
                                              setFieldValue(
                                                "reply_message",
                                                value
                                              )
                                            }
                                          />
                                        ) : (
                                          <Editor
                                            value={values.reply_message}
                                            init={{
                                              height: 200,
                                            }}
                                            disabled
                                          />
                                        )}

                                        {errors.reply_message &&
                                        touched.reply_message ? (
                                          <span className="errorMsg">
                                            {errors.reply_message}
                                          </span>
                                        ) : null}
                                      </div>
                                    </Col>
                                  </Row>
                                </div>
                              </Modal.Body>
                              <Modal.Footer>
                                {testimonialDetails.status == 1 && (
                                  <button
                                    className={`btn btn-success btn-sm ${
                                      isValid
                                        ? "btn-custom-green"
                                        : "btn-disable"
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
                                    {this.state.testimonial_id > 0
                                      ? isSubmitting
                                        ? "Sending..."
                                        : "Send"
                                      : isSubmitting
                                      ? "Submitting..."
                                      : "Submit"}
                                  </button>
                                )}

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
export default queries;
