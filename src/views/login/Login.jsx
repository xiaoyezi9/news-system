import React, { useCallback } from 'react'
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button,  Form, Input, message } from 'antd';
import Particles from "react-particles";
import { loadFull } from "tsparticles";
import './login.css'
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
export default function Login() {
  const particlesInit = useCallback(async (engine) => {
    await loadFull(engine);
  }, []);
  // 粒子效果配置
const options={
  background: {
    color: {
      value: "#0d47a1",
    },
  },
  fpsLimit: 120,
  interactivity: {
    events: {
      onClick: {
        enable: true,
        mode: "push",
      },
      onHover: {
        enable: true,
        mode: "repulse",
      },
      resize: true,
    },
    modes: {
      push: {
        quantity: 4,
      },
      repulse: {
        distance: 200,
        duration: 0.4,
      },
    },
  },
  particles: {
    color: {
      value: "#ffffff",
    },
    links: {
      color: "#ffffff",
      distance: 150,
      enable: true,
      opacity: 0.5,
      width: 1,
    },
    collisions: {
      enable: true,
    },
    move: {
      directions: "none",
      enable: true,
      outModes: {
        default: "bounce",
      },
      random: false,
      speed: 6,
      straight: false,
    },
    number: {
      density: {
        enable: true,
        area: 800,
      },
      value: 80,
    },
    opacity: {
      value: 0.5,
    },
    shape: {
      type: "circle",
    },
    size: {
      value: { min: 1, max: 5 },
    },
  },
  detectRetina: true,
}
const navigate=useNavigate()
const onFinish = (values) => {
  axios.get(`/users?username=${values.username}&password=${values.password}&roleState=true&_expand=role`).then(res => {
    if (res.data.length === 0) {
      message.error("用户名或密码不匹配")
    } else {
      localStorage.setItem("token", JSON.stringify(res.data[0]))
      navigate('/')
    }
  })
}
  return (
   <div style={{background:'rgb(35,39,65',height:'100%'}}>
        <Particles id="tsparticles"  init={particlesInit} options={options}/>
    <div className="formContainer">
      <div className="title">新闻发布管理系统</div>
     <Form name="normal_login" className="login-form" initialValues={{ remember: true, }} onFinish={onFinish}>
    <Form.Item name="username" rules={[
        {
          required: true,
          message: '请输入你的用户名!',
        },
      ]}
    >
   <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="Username" />
    </Form.Item>
    <Form.Item name="password"
      rules={[
        {
          required: true,
          message: '请输入你的密码!',
        },
      ]}
    >
      <Input prefix={<LockOutlined className="site-form-item-icon" />} type="password" placeholder="Password" />
    </Form.Item>
    <Form.Item>
      <Button type="primary" htmlType="submit" className="login-form-button"> 登录 </Button>
    </Form.Item>
  </Form>
  </div>
   </div>
  )
}
