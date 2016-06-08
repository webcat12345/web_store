<?php
/**
 * Created by PhpStorm.
 * User: rango
 * Date: 6/6/16
 * Time: 2:08 PM
 */
class User_model extends CI_Model{

    public function login($data){
        $condition = "user_name =" . "'" . $data['username'] . "' AND " . "user_password =" . "'" . $data['password'] . "'";
        $this->db->select('*');
        $this->db->from('user_login');
        $this->db->where($condition);
        $this->db->limit(1);
        $query = $this->db->get();

        if ($query->num_rows() == 1){
            return true;
        }   else    {
            return false;
        }
    }

    public function read_user_info($username){
        $condition = "user_name =" . "'" .$username . "'" ;
        $this->db->select('*');
        $this->db->from('user_login');
        $this->db->where($condition);
        $this->db->limit(1);
        $query = $this->db->get();

        if ($query->num_rows() == 1){
            return $query->result();
        }   else    {
            return false;
        }
    }
}