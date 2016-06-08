<?php
/**
 * Created by PhpStorm.
 * User: rango
 * Date: 6/6/16
 * Time: 11:08 AM
 */
class Show_article extends CI_Controller{

    public function __construct()
    {
        parent::__construct();
        $this->load->helper('url');
        $this->load->helper('form');
        $this->load->library('session');
        $this->load->model('article_model');
    }

    public function index()
    {
        $result = $this->article_model->read_article_information();
        $count = count($result);
        $data = array(
            'article_count' => $count,
            'article_info' =>$result
        );

        $this->load->view('template/header');
        $this->load->view('main_page/home' , $data);
        $this->load->view('template/footer');
    }

    public function add_new()
    {
        $this->load->view('template/header');
        $this->load->view('main_page/new');
        $this->load->view('template/footer');
    }

    public function submit_new_article()
    {
        $data = array(
            'username' =>$this->session->userdata['logged_in']['username'],
            'email' =>$this->session->userdata['logged_in']['email'],
            'date' =>date("Y-m-d"),
            'subject' =>$this->input->post('subject'),
            'content' =>$this->input->post('content')
        );
        $this->article_model->write_article_information($data);
        redirect(show_article);
    }
}