import { Button, Form, Input, message, notification, PageHeader, Select } from "antd";
import React, { useEffect, useState, useRef } from "react";
import { Steps } from "antd";
import axios from "axios";
import NewsEditor from "../../../components/news-manage/NewsEditor";
import { useNavigate } from "react-router-dom";
const { Step } = Steps;
const { Option } = Select;

export default function NewsAdd() {
  const [current, setCurrent] = useState(0)
  const [categoryList, setCategoryList] = useState([])
  const [formInfo,setFormInfo] = useState({}) // formInfo收集的是第一步基本信息中两个输入框的内容
  const [content,setContent] = useState("") // content收集的是富文本编辑框中输入的内容
const navigate=useNavigate()
  const user = JSON.parse(localStorage.getItem('token'))  // 可以去本地存储里面看到user包裹的数据

  const handleNext = () => { // 点击下一步触发的函数

    if(current === 0){
      /**
       * 需要通过校验才能到下一步
       * 只要点击下一步，就通过ref校验输入框中是否有内容(输入框是必填项)，
       * 校验的方法：通过ref拿到Form的实例，里面有一个validateFields()方法，校验通过走 .then ，校验不通过(输入框没有内容)走 .catch
       */
      NewsForm.current.validateFields().then(res=>{
        // console.log('校验通过：',res);
        setFormInfo(res)
        setCurrent(current+1)
      }).catch(error=>{
        // console.log('校验不通过：',error);
      })
    }else{
      // console.log(formInfo,content);
      if(content === '' || content.trim() === "<p></p>"){              //content.trim()是去首尾空格
          // 如果富文本编辑框没有输入内容，是不能进入到下一步的
          message.error('新闻内容不能为空')
      }else{
        setCurrent(current + 1)
      }
    }
  }

  const handlePrevious = () => { // 点击上一步触发的函数
    setCurrent(current - 1)
  }

  const NewsForm = useRef(null)

  // 向后端请求新闻的分类
  useEffect(() => {
    axios.get('/categories').then(res => {
      setCategoryList(res.data)
    })
  }, [])

  const handleSave = (auditState) =>{
    axios.post('/news',{
      // "title": "千锋教育","categoryId": 3, 可以被 ...formInfo 代替
      ...formInfo, 
      "content":content,
      "region": user.region ? user.region : "全球",
      "author": user.username,
      "roleId": user.roleId,
      "auditState": auditState, // auditState 为0，表示草稿箱；为1，表示待审核；为2，表示审核通过；为3，表示审核未通过
      "publishState": 0, //publishState 为0，表示未发布；为1，表示已发布；为2，表示已下线
      "createTime": Date.now(), // 表示时间戳
      "star": 0, // 点赞数量为0
      "view": 0, // 浏览数量为0
      // "id": 1, 不用写，id 会通过 post 自增长的
      // "publishTime": 0 // 未发布，所以就没有发布时间，所以暂时不写这个字段
    }).then(res=>{
      navigate(auditState === 0 ? '/news-manage/draft' : '/audit-manage/list')

      notification.info({
          message:'通知',
          description:
          `您可以到${auditState === 0 ? '草稿箱' : '审核列表'}中查看您的新闻`,
          placement:'bottomRight'
      })
    })
  }

  return (
    <div>
      <PageHeader  // 标题头
        className="site-page-header"
        title="撰写新闻"
        subTitle="This is a subtitle"
      />

      {/* 步骤条 */}
      <Steps current={current}>
        <Step title="基本信息" description="新闻标题,新闻分类" />
        <Step title="新闻内容" description="新闻主体内容" />
        <Step title="新闻提交" description="保存草稿或提交审核" />
      </Steps>

      {/* 主体内容区域 */}
      <div style={{ margin: '50px' }}>

        {/* 基本信息 */}
        <div style={{ display: current === 0 ? "" : "none" }}>
          <Form
            name="basic"
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 20 }}  // 4:20 其实是label和输入框在一行上面的宽度比例
            ref={NewsForm} 
          >
            <Form.Item
              label="新闻标题"
              name="title"
              rules={[{ required: true, message: 'Please input your username!' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="新闻分类"
              name="categoryId"
              rules={[{ required: true, message: 'Please input your username!' }]}
            >
              <Select>
                {
                  categoryList.map(item=><Option value={item.id} key={item.id}>{item.title}</Option>)
                }
              </Select>
            </Form.Item>
          </Form>
        </div>

        {/* 新闻内容  */}
        <div style={{ display: current === 1 ? "" : "none" }}>

          {/* 使用富文本编辑器:React Draft Wysiwyg ,这部分代码封装到组件 NewsEditor 里面 */}
          <NewsEditor getCurrent={(value)=>{
              // 子传父，在子组件通过props.getConten就可以调用回调函数
              // console.log(value); // 在富文本输入 aaa ，打印<p>aaa</p>
              setContent(value)
          }}></NewsEditor>
        </div>
      </div>

      {/* 最下面的跳转按钮 */}
      <div style={{ marginTop: "50px" }}>
        {
          current === 2 && <span>
            <Button type='primary' onClick={()=>handleSave(0)}>保存草稿箱</Button>
            <Button danger onClick={()=>handleSave(1)}>提交审核</Button>
          </span>
        }
        {
          current < 2 && <Button type='primary' onClick={handleNext}>下一步</Button>
        }
        {
          current > 0 && <Button onClick={handlePrevious}>上一步</Button>
        }
      </div>
    </div>
  )
}
