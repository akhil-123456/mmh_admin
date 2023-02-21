import React, { Component } from "react";
import { Link } from "react-router-dom";
import { getSuperAdmin } from "../../../shared/helper";

class SidebarAdmin extends Component {
  constructor() {
    super();
    this.state = {
      shown: "",
      innerShown: "",
      super_admin: 0,
    };
  }

  toggleMenu(event) {
    event.preventDefault();
    this.setState({ shown: !this.state.shown });
  }

  componentDidMount = () => {
    var path = this.props.path_name; //console.log(path);
    if (
      path === "/featured_list" ||
      path === "/faqs" ||
      path === "/user_reviews" ||
      path == "/price" ||
      path == "/tcpc" ||
      path == "/edit_content/:id"
    ) {
      this.setState({ shown: "1" });
    }

    if (this.props.isLoggedIn === true) {
      const superAdmin = getSuperAdmin(localStorage.admin_token);
      if (superAdmin) {
        this.setState({ super_admin: 1 });
      } else {
        return null;
      }
    }
  };

  handlePlus = (event) => {
    event.preventDefault();
    const id = event.target.getAttribute("data-id");
    id != this.state.shown
      ? this.setState({ shown: id })
      : this.setState({ shown: "" });
  };

  innerHandlePlus = (event) => {
    event.preventDefault();
    const id = event.target.getAttribute("inner-data-id");
    console.log(id);
    id != this.state.innerShown
      ? this.setState({ innerShown: id })
      : this.setState({ innerShown: "" });
  };

  getAdminMenu = () => {
    const rotate = this.state.shown;
    const innerRotate = this.state.innerShown;
    return (
      <section className="sidebar">
        <ul className="sidebar-menu">
          {this.props.path_name === "/dashboard" ? (
            <li className="active">
              {" "}
              <Link to="/dashboard">
                {" "}
                <i className="fas fa-tachometer-alt"></i> <span>Dashboard</span>
              </Link>{" "}
            </li>
          ) : (
            <li>
              {" "}
              <Link to="/dashboard">
                {" "}
                <i className="fas fa-tachometer-alt"></i> <span>Dashboard</span>
              </Link>{" "}
            </li>
          )}

          {this.props.path_name === "/users_list" ? (
            <li className="active">
              {" "}
              <Link to="/users_list">
                {" "}
                <i className="fas fa-user sub-menu"></i> <span> Users</span>
              </Link>{" "}
            </li>
          ) : (
            <li>
              {" "}
              <Link to="/users_list">
                {" "}
                <i className="fas fa-user sub-menu"></i> <span> Users</span>
              </Link>{" "}
            </li>
          )}

             {this.props.path_name === "/sub_admin" ? (
            <li className="active">
              {" "}
              <Link to="/sub_admin">
                {" "}
                <i className="fas fa-users sub-menu"></i> <span> Sub Admins</span>
              </Link>{" "}
            </li>
          ) : (
            <li>
              {" "}
              <Link to="/sub_admin">
                {" "}
                <i className="fas fa-users sub-menu"></i> <span> Sub Admins</span>
              </Link>{" "}
            </li>
          )}

          {this.props.path_name === "/queries_list" ? (
            <li className="active">
              {" "}
              <Link to="/queries_list">
                {" "}
                <i className="fa fa-envelope"></i> <span>User Queries</span>
              </Link>{" "}
            </li>
          ) : (
            <li>
              {" "}
              <Link to="/queries_list">
                {" "}
                <i className="fa fa-envelope"></i> <span>User Queries</span>
              </Link>{" "}
            </li>
          )}

          <li className={rotate == "1" ? "treeview active" : "treeview"}>
            <Link to="#" data-id="1" onClick={this.handlePlus}>
              <i
                className="fas fa-certificate sub-menu"
                data-id="1"
                onClick={this.handlePlus}
              ></i>{" "}
              <span data-id="1" onClick={this.handlePlus}>
                Manage CMS{" "}
              </span>
              <span className="pull-right-container">
                <i
                  data-id="1"
                  onClick={this.handlePlus}
                  className={
                    rotate == "1"
                      ? "fa pull-right fa-minus"
                      : "fa pull-right fa-plus"
                  }
                ></i>
              </span>
            </Link>

            <ul className="treeview-menu">
              {this.props.path_name === "/featured_list" ? (
                <li className="active">
                  {" "}
                  <Link to="/featured_list">
                    {" "}
                    <i className="fas fa-compress"></i>{" "}
                    <span> Featured List </span>
                  </Link>{" "}
                </li>
              ) : (
                <li>
                  {" "}
                  <Link to="/featured_list">
                    {" "}
                    <i className="fas fa-compress"></i>{" "}
                    <span> Featured List </span>
                  </Link>{" "}
                </li>
              )}
            </ul>
            <ul className="treeview-menu">
              {this.props.path_name === "/faqs" ? (
                <li className="active">
                  {" "}
                  <Link to="/faqs">
                    {" "}
                    <i className="fas fa-clipboard-list sub-menu"></i>{" "}
                    <span> FAQs </span>
                  </Link>{" "}
                </li>
              ) : (
                <li>
                  {" "}
                  <Link to="/faqs">
                    {" "}
                    <i className="fas fa-clipboard-list sub-menu"></i>{" "}
                    <span> FAQs </span>
                  </Link>{" "}
                </li>
              )}
            </ul>
            <ul className="treeview-menu">
              {this.props.path_name === "/user_reviews" ? (
                <li className="active">
                  {" "}
                  <Link to="/user_reviews">
                    {" "}
                    <i className="fas fa-award"></i> <span> User Review </span>
                  </Link>{" "}
                </li>
              ) : (
                <li>
                  {" "}
                  <Link to="/user_reviews">
                    {" "}
                    <i className="fas fa-award"></i> <span> User Review </span>
                  </Link>{" "}
                </li>
              )}
            </ul>
            <ul className="treeview-menu">
              {this.props.path_name === "/price" ? (
                <li className="active">
                  {" "}
                  <Link to="/price">
                    {" "}
                    <i className="fas fa-award"></i>{" "}
                    <span>Subscription Price</span>
                  </Link>{" "}
                </li>
              ) : (
                <li>
                  {" "}
                  <Link to="/price">
                    {" "}
                    <i className="fas fa-award"></i>{" "}
                    <span> Subscription Price </span>
                  </Link>{" "}
                </li>
              )}
            </ul>

            <ul className="treeview-menu">
              {this.props.path_name === "/tcpc" ? (
                <li className="active">
                  {" "}
                  <Link to="/tcpc">
                    {" "}
                    <i className="fa fa-exclamation-triangle"></i>
                    <span>Terms and Privacy</span>
                  </Link>{" "}
                </li>
              ) : (
                <li>
                  {" "}
                  <Link to="/tcpc">
                    {" "}
                    <i className="fa fa-exclamation-triangle"></i>
                    <span>Terms and Privacy</span>
                  </Link>{" "}
                </li>
              )}
            </ul>
          </li>
        </ul>
      </section>
    );
  };

  render() {
    if (this.props.isLoggedIn === false) return null;
    return <aside className="main-sidebar">{this.getAdminMenu()}</aside>;
  }
}

export default SidebarAdmin;
