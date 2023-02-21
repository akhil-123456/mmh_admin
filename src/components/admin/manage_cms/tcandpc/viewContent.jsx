import React, { Component } from "react";
import API from "../../../../shared/admin-axios";
import { showErrorMessage } from "../../../../shared/handle_error";
import Layout from "../../layout/Layout";
import LoaderSpinner from "../../Loader/loader";
import { htmlDecode } from "../../../../shared/helper";
import ReactHtmlParser from "react-html-parser";

class ViewContent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      TcPcDetails: "",
    };
  }

  componentDidMount() {
    API.get(`/api/adm/tc_pc_details/${this.props.match.params.id}`)
      .then((res) => {
        this.setState({
          TcPcDetails: res.data.data[0],
          isLoading: false,
        });
      })
      .catch((err) => {
        this.setState({
          isLoading: false,
        });
        showErrorMessage(err, this.props);
      });
  }

  render() {
    const { TcPcDetails } = this.state;

    return (
      <>
        {this.state.isLoading ? (
          <LoaderSpinner />
        ) : (
          <Layout {...this.props}>
            <div className="content-wrapper">
              <section className="content-header">
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
                    <center>
                      <h1> {TcPcDetails != "" ? TcPcDetails.title : ""}</h1>
                    </center>
                    <br></br>
                    {TcPcDetails != ""
                      ? ReactHtmlParser(htmlDecode(TcPcDetails.description))
                      : null}
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
export default ViewContent;
