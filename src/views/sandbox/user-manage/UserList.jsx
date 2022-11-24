// @ts-nocheck
import { Button, Modal, Switch, Table } from "antd";
import axios from "axios";
import * as XLSX from 'xlsx';
import React, { useEffect, useRef, useState } from "react";
import {
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  DownloadOutlined 
} from "@ant-design/icons";
import UserForm from "../../../components/user-manage/UserForm";
const { confirm } = Modal;
export default function UserList() {
  const [dataSource, setdataSource] = useState([]);
  const [isAddVisible, setisAddVisible] = useState(false);
  const [isUpdateVisible, setisUpdateVisible] = useState(false);
  const [isUpdateDisabled, setisUpdateDisabled] = useState(false);
  const [roleList, setroleList] = useState([]);
  const [regionList, setregionList] = useState([]);
  // @ts-ignore
  const [current, setcurrent] = useState([]);
  const addForm = useRef(null);
  const updateForm = useRef(null);
  const { roleId, region, username } = JSON.parse(localStorage.getItem("token"))
  const roleObj = {
    "1": "superadmin",
    "2": "admin",
    "3": "editor",
  }
  useEffect(() => {
    axios.get("/users?_expand=role").then((res) => {
      const list=res.data
      setdataSource(roleObj[roleId]==='superadmin'?
      list
      :[
        ...list.filter(item=>item.username===username),
        ...list.filter(item=>item.region===region&&roleObj[item.roleId]==='editor'),
      ]);
  });
  }, [roleId, region, username]);
  useEffect(() => {
    axios.get("/regions").then((res) => {
      setregionList(res.data);
    });
  }, []);
  useEffect(() => {
    axios.get("/roles").then((res) => {
      setroleList(res.data);
    });
  }, []);

  const columns = [
    {
      title: "区域",
      dataIndex: "region",
      render: (region) => {
        return <b>{region === "" ? "全球" : region}</b>;
      },
      filters: [
        ...regionList.map((item) => ({
          // @ts-ignore
          text: item.title,
          // @ts-ignore
          value: item.value,
        })),
        {
          text: "全球",
          value: "全球",
        },
      ],
      onFilter: (value, item) => {
        if (value === "全球") {
          return item.region === "";
        }
        return item.region === value;
      },
    },
    {
      title: "角色名称",
      dataIndex: "role",
      render: (role) => {
        return role.roleName;
      },
    },
    {
      title: "用户名",
      dataIndex: "username",
    },
    {
      title: "用户状态",
      dataIndex: "roleState",
      render: (roleState, item) => {
        return (
          <Switch
            checked={roleState}
            disabled={item.default}
            onChange={() => handleChange(item)}
          ></Switch>
        );
      },
    },
    {
      title: "操作",
      render: (item) => {
        return (
          <div>
            <Button
              danger
              shape="circle"
              icon={<DeleteOutlined />}
              disabled={item.default}
              onClick={() => confirmMethod(item)}
            />
            <Button
              type="primary"
              shape="circle"
              disabled={item.default}
              icon={<EditOutlined />}
              onClick={() => handleUpdate(item)}
            />
          </div>
        );
      },
    },
  ];
  // 切换用户状态
  const handleChange = (item) => {
    item.roleState = !item.roleState;
    setdataSource([...dataSource]);
    axios.patch(`/users/${item.id}`,{
      roleState: item.roleState
    })

  };

  const confirmMethod = (item) => {
    confirm({
      title: "你确定要删除？",
      icon: <ExclamationCircleOutlined />,
      onOk() {
        deleteMethod(item);
      },
      onCancel() {},
    });
  };

  const deleteMethod = (item) => {
    // @ts-ignore
    setdataSource(dataSource.filter((data) => data.id !== item.id));
    axios.delete(`/users/${item.id}`);
  };

  const addFormOk = () => {
    // @ts-ignore
    addForm.current
      .validateFields()
      .then((value) => {
        setisAddVisible(false);
        // @ts-ignore
        addForm.current.resetFields();
        axios.post("/users", {
            ...value,
            roleState: true,
            default: false,
          })
          .then((res) => {
            // @ts-ignore
            setdataSource([ ...dataSource, {
                ...res.data,
                // @ts-ignore
                role: roleList.filter((item) => item.id === value.roleId)[0],
              },
            ]);
          });
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const handleUpdate = (item) => {
    setisUpdateVisible(true)
    if(item.roleId===1){
    //disabled
    setisUpdateDisabled(true)
    }else{
      setisUpdateDisabled(false)
    }
setTimeout(() => {
  // @ts-ignore
  updateForm.current.setFieldsValue(item)
  setcurrent(item)
}, 0);
  };
  const updateFormOk = () => {
    // @ts-ignore
    updateForm.current.validateFields().then(value => {
      setisUpdateVisible(false)
      // @ts-ignore
      setdataSource(dataSource.map(item => {
        // @ts-ignore
        if (item.id === current.id) {
          return {
            // @ts-ignore
            ...item,
            ...value,
            // @ts-ignore
            role: roleList.filter(data => data.id === value.roleId)[0]
          }
        }
        return item
      }))
      setisUpdateDisabled(!isUpdateDisabled)
      // @ts-ignore
      axios.patch(`/users/${current.id}`, value)
    }).catch(err => {
      console.log(err)
    })
  }
  //导出为Excel
const  exportExcel=(e)=>{
  const entozh = {
    "username":"姓名",
    "rolename":"权限",
    "region":"所在地区"
  }
  const roleNameObj={
    1:'超级管理员',
    2:'区域管理员',
    3:'区域编辑'
  }
  //对数据进行处理
const data =dataSource.map(item=>{
  switch (item.roleId) {
    case 1: item.rolename=roleNameObj[1]   
      break;
  case 2:item.rolename=roleNameObj[2]   
    break;
    case 3:
      item.rolename=roleNameObj[3] 
      break;
  }
   if(item.region==='') {item.region='全球'}   
  return Object.keys(item).reduce((newData, key) => {
    if (entozh[key]) {
      const newKey = entozh[key] || key  
     newData[newKey] = item[key]
    }  
    return newData
  }, {})
})

// console.log(json);
const sheet = XLSX.utils.json_to_sheet(data);

const  openDownloadDialog = (url, saveName) => {
  if (typeof url == 'object' && url instanceof Blob) {
    url = URL.createObjectURL(url); // 创建blob地址
  }
  var aLink = document.createElement('a');
  aLink.href = url;
  aLink.download = saveName || ''; // HTML5新增的属性，指定保存文件名，可以不要后缀，注意，file:///模式下不会生效
  var event;
  if (window.MouseEvent) event = new MouseEvent('click');
  else {
    event = document.createEvent('MouseEvents');
    event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
  }
  aLink.dispatchEvent(event);
}
const sheet2blob = (sheet, sheetName) => {
  sheetName = sheetName || 'sheet1';
  var workbook = {
    SheetNames: [sheetName],
    Sheets: {}
  };
  workbook.Sheets[sheetName] = sheet; // 生成excel的配置项

  var wopts = {
    bookType: 'xlsx', // 要生成的文件类型
    bookSST: false, // 是否生成Shared String Table，官方解释是，如果开启生成速度会下降，但在低版本IOS设备上有更好的兼容性
    type: 'binary'
  };
  var wbout = XLSX.write(workbook, wopts);
  var blob = new Blob([s2ab(wbout)], {
    type: "application/octet-stream"
  }); // 字符串转ArrayBuffer
  function s2ab(s) {
    var buf = new ArrayBuffer(s.length);
    var view = new Uint8Array(buf);
    for (var i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
    return buf;
  }

  return blob;
}
openDownloadDialog(sheet2blob(sheet,undefined), `用户信息.xlsx`);



}

  return (
    <div>
      <Button
        type="primary"
        onClick={() => {
          setisAddVisible(true);
        }}
      >
        添加用户
      </Button>
      <Button style={{marginLeft:'20px'}} type="primary" icon={<DownloadOutlined />} onClick={()=>{
        exportExcel()
      }} >导出Excel</Button>
      <Table
        dataSource={dataSource}
        columns={columns}
        pagination={{ pageSize: 5 }}
        rowKey={(item) => {
          return item.id;
        }}
      />

      {/* 添加用户模态框 */}
      <Modal
        open={isAddVisible}
        title="添加用户"
        okText="确定"
        cancelText="取消"
        onCancel={() => {
          setisAddVisible(false);
        }}
        onOk={() => {
          addFormOk();
        }}
      >
        <UserForm
          ref={addForm}
          // @ts-ignore
          regionList={regionList}
          roleList={roleList}
          
        ></UserForm>
      </Modal>
      {/* 更新用户模态框 */}
      <Modal
        open={isUpdateVisible}
        title="更新用户"
        okText="确定"
        cancelText="取消"
        onCancel={() => {
          setisUpdateVisible(false)
          setisUpdateDisabled(!isUpdateDisabled); 
        }}
        onOk={() => {
          updateFormOk();
        }}
      >
        <UserForm
          ref={ updateForm}
          // @ts-ignore
          regionList={regionList}
          roleList={roleList}
          isUpdateDisabled={isUpdateDisabled}

        ></UserForm>
      </Modal>
    </div>
  );
}
