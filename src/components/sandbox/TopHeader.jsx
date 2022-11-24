import React, { useState } from "react";
import { Layout, Dropdown, Menu, Avatar } from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined 
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { connect } from "react-redux";
const { Header } = Layout;
function TopHeader(props) {
  const navigate = useNavigate()
  // @ts-ignore
  const { role: { roleName }, username } = JSON.parse(localStorage.getItem("token"))

  //控制侧边栏伸缩
 const changeCollapsed = () => {
  props.changeCollapsed()
  };

  const menu = (
    <Menu
      items={[
        {  key: "1",  label: roleName, },
        { key: "2", danger: true, label:(
          <i style={{display: 'block',width:'100%'}} onClick={()=>{
            localStorage.removeItem("token")
            navigate('/login')
          }}>退出</i>
        ), },
      ]}
    />
  );

  return (
    <Header className="site-layout-background" style={{ padding: " 0 16px " }}>
      {props.isCollapsed ? (
        <MenuUnfoldOutlined onClick={changeCollapsed} />
      ) : (
        <MenuFoldOutlined onClick={changeCollapsed} />
      )}
      <div style={{ float: "right" }}>
        <span>欢迎{username}回来</span>
        <Dropdown overlay={menu}><a onClick={(e) => e.preventDefault()}>
        <Avatar size="large" icon={<UserOutlined />} />
        </a>
      </Dropdown>
      </div>
      
    </Header>
  );
}
// connect(mapStateToProps,mapDispatchToProps)(组件)

const mapStateToProps = (state) => {
  return {
      isCollapsed:state.CollapsedReducer.isCollapsed
  }
}

const mapDispatchToProps = {
  changeCollapsed() {
      return {
          type: "change_collapsed",

      }
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(TopHeader)
