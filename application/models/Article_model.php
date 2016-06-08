<?php
/**
 * Created by PhpStorm.
 * User: rango
 * Date: 6/6/16
 * Time: 12:39 PM
 */
class Article_model extends CI_Model{

    public function read_article_information(){
        $this->db->select('*');
        $this->db->from('article_news');
        $this->db->limit(100);
        $query = $this->db->get();
        return $query->result();
    }

    public function write_article_information($data){
        $query_data = array(
            'user_name' => $data['username'],
            'user_email'=>$data['email'],
            'date'=>$data['date'],
            'subject' => $data['subject'],
            'content' => $data['content']
        );
        $this->db->insert('article_news' , $query_data);
    }
}

