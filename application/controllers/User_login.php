<?php
/**
 * Created by PhpStorm.
 * User: rango
 * Date: 6/6/16
 * Time: 10:23 AM
 */
class User_login extends CI_Controller {

    public function __construct()
    {
        parent::__construct();
        $this->load->helper('url');
        $this->load->helper('form');
        $this->load->library('form_validation');
        $this->load->library('session');
        $this->load->model('user_model');
    }

    public function index(){
        $this->load->view('template/header');
        $this->load->view('login/login_form');
        $this->load->view('template/footer');
    }

    public function user_login_process(){

        $this->form_validation->set_rules('username' , 'Username' , 'required');
        $this->form_validation->set_rules('password' , 'Password' , 'required');

        if ($this->form_validation->run() == FALSE){
            if (isset($this->session->userdata['logged_in'])){
                redirect('show_article');
            }   else    {
                redirect('user_login');
            }
        }   else    {
            $data = array(
                'username' => $this->input->post('username'),
                'password' => $this->input->post('password')
            );
            $result = $this->user_model->login($data);
            if ($result == TRUE){
                $username = $this->input->post('username');
                $result = $this->user_model->read_user_info($username);
                if ($result != false){
                    $session_data = array(
                        'username' => $result[0]->user_name,
                        'email' => $result[0]->user_email
                    );
                    $this->session->set_userdata('logged_in' , $session_data);
                    redirect('show_article');
                }
            }   else    {
                $data = array(
                    'error_message' => 'Invalid Username or Password'
                );
                $this->load->view('template/header');
                $this->load->view('login/login_form' , $data);
                $this->load->view('template/footer');
            }
        }
    }
}