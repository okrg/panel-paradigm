<?php
// this is legacy code from the prior Babylon implementation.
// use this to determine the position of individual panels for front, back, left, and right
// signature series, portland series and summit series units are defined by this spec

function signature_panel_map_dupe($depth, $length) {
    $front_el = 'FL' . (string)$length;
    $back_el = 'B' . (string)$length;
    $right_el = 'R' . (string)$depth;
    $left_el = 'L' . (string)$depth;

    $elevations = array(
        'FL34' => array(
            'width' => 34,
            'origin' => -198,
            'panel' => 'FL34-36L-D72C-36R'
        ),
        'B34' => array(
            'width' => 34,
            'origin' => 198,                
            'panel' => 'B34-18L-18R'
        ),
        'R18' => array(
            'width' => 18,
            'origin' => 107.5,           
            'panel' => 'R18-42C'
        ),
        'L18' => array(
            'width' => 18,
            'origin' => -107.5,          
            'panel' => 'L18-42C'
        )
    );
    $panels = array();

    $front = array();
    $origin = $elevations[$front_el]['origin'];
    $panel_idx = 1;
    $front_z = ($depth*12)/2;
    $inches = $elevations[$front_el]['width']*12;
    $front[] = array(
      'slot' => 'f1',
      'model' => $elevations[$front_el]['panel'],                
      'width'=> $inches,
      'x' => $origin,
      'y' => -9,
      'z' => $front_z
    );
    $panels['f1'] = array(
        $front_el . '-W2L-D36CL',
        $front_el . '-W2L-D72CL-W2C-36R',
        $front_el . '-36CL-D72C-36CR',
        $front_el . '-36CL-W2CR-D72R',
        $front_el . '-36L-D72C-36R',
        $front_el . '-36L-W2C-D72CR-W2R',
        $front_el . '-42CL-D72C-42CR',
        $front_el . '-42L-D72C-42R',
        $front_el . '-72CL-D72C-72CR',
        $front_el . '-72CL-D72C',
        $front_el . '-72L-D72C-72R',
        $front_el . '-D72C-72CR',
        $front_el . '-D72L-W2CL-36CR',
        $front_el . '-W2CL-D72C-W2CR'
    );

    $back = array();
    $origin = $elevations[$back_el]['origin'];
    $panel_idx = 1;
    $back_z = -(($depth*12)/2);
    $inches = $elevations[$back_el]['width']*12;
    $back[] = array(
      'slot' => 'b1',
      'model' => $elevations[$back_el]['panel'],
      'width'=> $inches,
      'x' => $origin,
      'y' => -9,
      'z' => $back_z
    );    
    $panels['b1'] = array(
        $back_el . '-18L-18R',
        $back_el . '-D36R',
        $back_el . '-18L-18C-18R',
        $back_el . '-18L-18C-D36R',
        $back_el . '-18L-18R',
        $back_el . '-18L-D72C-18R',
        $back_el . '-18L',
        $back_el . '-18R',
        $back_el . '-36L-36R',
        $back_el . '-36L',
        $back_el . '-36R',
        $back_el . '-42L',
        $back_el . '-42R',
        $back_el . '-D36L-18C-18R debug',
        $back_el . '-D36L-18C-18R',
        $back_el . '-D36L'
    );
    

    $right = array();
    $origin = $elevations[$right_el]['origin'];
    $panel_idx = 1;
    $right_x = ($length*12)/2;
    $right_x = $right_x - 1;
    $inches = $elevations[$right_el]['width']*12;
    $right[] = array(
      'slot' => 'r1',
      'model' => $elevations[$right_el]['panel'],
      'width'=> $inches,
      'x' => $right_x,
      'y' => -9,
      'z' => $origin
    );    
    $panels['r1'] = array(
        $right_el . '-18L-D36R',
        $right_el . '-36L-36R',
        $right_el . '-36L-D36C',
        $right_el . '-42C',
        $right_el . '-42L-42C',
        $right_el . '-42L-42R',
        $right_el . '-42L',
        $right_el . '-D36L-36C',
        $right_el . '-D36L-36R',
        $right_el . '-D36L-42C',
        $right_el . '-W2L-36R',
        $right_el . '-W2L-42R'
    );


    $left = array();
    $origin = $elevations[$left_el]['origin'];
    $panel_idx = 1;
    $left_x = -(($length*12)/2);
    $left_x = $left_x + 1;
    $inches = $elevations[$left_el]['width']*12;
    $left[] = array(
      'slot' => 'l1',
      'model' => $elevations[$left_el]['panel'],
      'width'=> $inches,
      'x' => $left_x,
      'y' => -9,
      'z' => $origin
    );



    $panels['l1'] = array(
        $left_el . '-D36L-18R',
        $left_el . '-D36C-36R',
        $left_el . '-42R',
        $left_el . '-42L-W2R',
        $left_el . '-42L-42R',
        $left_el . '-42C',
        $left_el . '-42C-D36R',
        $left_el . '-42C-42R',
        $left_el . '-36L-W2R',
        $left_el . '-36L-D36R',
        $left_el . '-36L-36R',
        $left_el . '-36C-D36R'
    );



    $sizecode = $depth . 'x' . $length;

    $roof_offset = 0;
    $data = array(
      'model' => 'summit',
      'size' => $sizecode,
      'depth' => (int)$depth,
      'length' => (int)$length,
      'name' => 'summit ' . $sizecode,
      'roof' => array(
          'model' => $sizecode . '-STV',
          'x' => 0,
          'y' => (-9 + $roof_offset),
          'z' => 0
      ),
      'floor' => array(
          'width' => $length*12,
          'height' => 12,
          'depth' => $depth*12,
          'x' => ($length*12)/2,
          'y' => -9,
          'z' => ($depth*12)/2                
      ),
      'name' => $sizecode . ' summit',    
      'front' => $front,
      'back' => $back,
      'left' => $left,
      'right' => $right,
      'panels' => $panels
    );
    
    return $data;
}

function summit_panel_map($depth, $length) {
    $shell_base_price = array(
      '14x18' => 38727,
      '14x22' => 44487,
      '14x26' => 48756,
      '14x30' => 54533,
      '14x34' => 58636,
      '16x18' => 40027,
      '16x22' => 46022,
      '16x26' => 50610,
      '16x30' => 55603,
      '16x34' => 60788,
      '16x38' => 65645,
      '18x18' => 43510,
      '18x22' => 50062,
      '18x26' => 54235,
      '18x30' => 60614,
      '18x34' => 66244,
      '18x38' => 70276,
      '18x42' => 75739,
      '20x22' => 51450,
      '20x26' => 55856,
      '20x30' => 62397,
      '20x34' => 66159,
      '20x38' => 72217,
      '20x42' => 77801,
      '20x46' => 80984,
      '20x50' => 87551
    );

    $inch_map = array(
      'RT1C' => 72,
      'RT2L' => 47.5,
      'RT3R' => 47.5,
      'RT3C' => 47.5,
      'RT3R' => 47.5,
      'RT4R' => 71.5,
      'RT5L' => 71.5,
      'RT6R' => 48,
      'RT7L' => 23.5,
      'LT1C' => 72,
      'LT2R' => 47.5,
      'LT3L' => 47.5,
      'LT3C' => 47.5,
      'LT4L' => 71.5,
      'LT5R' => 71.5,
      'LT6L' => 48,
      'LT7R' => 23.5,
      'FL06L' => 6,
      'FL06R' => 6,
      'FL12C' => 12,
      'FL12L' => 12,
      'FL12R' => 12,
      'FL18L' => 18,
      'FL18R' => 18,
      'FL72C' => 72,
      'FL72L' => 72,
      'FL72R' => 72,
      'FL84L' => 84,   
      'FL84C' => 84,
      'FL84R' => 84,
      'FM06L' => 6,
      'FM06R' => 6,
      'FM12C' => 12,
      'FM12L' => 12,
      'FM12R' => 12,
      'FM18L' => 18,
      'FM18R' => 18,
      'FM72C' => 72,
      'FM72L' => 72,
      'FM72R' => 72,
      'FM84C' => 84,
      'FM84L' => 84,
      'FM84R' => 84,
      'BT20L-06' => 6,
      'BT20R-06' => 6,
      'BT20C-96' => 96,
      'BT20C-48' => 48,
      'BT16L-06' => 6,
      'BT16R-06' => 6,
      'BT16C-96' => 96,
      'BT16C-48' => 48,
      'BT12L-06' => 6,
      'BT12R-06' => 6,
      'BT12C-96' => 96,
      'BT12C-48' => 48
    );


    switch($depth) {
      case 20:
        $front_prefix = 'FL';
        $back_prefix = 'BT20x';
        break;
      default:
      case 18:
        $front_prefix = 'FL';
        $back_prefix = 'BT16x';
        break;
      case 16:
        $front_prefix = 'FM';
        $back_prefix = 'BT16x';
        break;
      case 14:
        $front_prefix = 'FM';
        $back_prefix = 'BT12x';
        break;
      case 12:
        $front_prefix = 'FS';
        $back_prefix = 'BT12x';
        break;
    }

    $front_el = $front_prefix . (string)$length;
    $back_el = $back_prefix . (string)$length;
    $right_el = 'RT' . (string)$depth;
    $left_el = 'LT' . (string)$depth;

    $elevations = array(
        'FL18' => array(
            'width' => 18,
            'origin' => -102,
            'panels' => array('FL18L', 'FL84C-D72C', 'FL84C', 'FL18R')
        ),
        'FL22' => array(
            'width' => 22,
            'origin' => -126,
            'panels' => array('FL84L', 'FL84C-D72C', 'FL84R')
        ),
        'FL26' => array(
            'width' => 26,
            'origin' => -150,
            'panels' => array('FL12L','FL84C', 'FL12C', 'FL84C-D72C', 'FL12C', 'FL84C','FL12R')
        ),
        'FL30' => array(
            'width' => 30,
            'origin' => -174,
            'panels' => array('FL06L', 'FL84C', 'FL84C-D72C', 'FL84C', 'FL84C', 'FL06R')
        ),
        'FL34' => array(
            'width' => 34,
            'origin' => -198,
            'panels' => array('FL72L', 'FL84C', 'FL84C-D72C', 'FL84C', 'FL72R')
        ),
        'FL38' => array(
            'width' => 38,
            'origin' => -222,
            'panels' => array('FL12L','FL84C-72C', 'FL84C-W2R', 'FL84C-D72C', 'FL84C-W2L', 'FL84C-72C','FL12R')
        ),
        'FL42' => array(
            'width' => 46,
            'origin' => -246,
            'panels' => array('FL06L', 'FL72C', 'FL84C', 'FL84C-D72C', 'FL84C', 'FL84C', 'FL72C', 'FL06R')
        ),
        'FL46' => array(
            'width' => 46,
            'origin' => -270,
            'panels' => array('FL18L', 'FL84C', 'FL84C', 'FL84C-D72C', 'FL84C', 'FL84C', 'FL84C', 'FL18R')
        ),
        'FL50' => array(
            'width' => 50,
            'origin' => -294,                
            'panels' => array('FL84L', 'FL84C', 'FL84C', 'FL84C-D72C', 'FL84C', 'FL84C', 'FL84R')
        ),
        'FM18' =>array(
            'width' => 18,
            'origin' => -102,
            'panels' => array('FM18L', 'FM84C-D72C', 'FM84C', 'FM18R')
        ),
        'FM22' =>array(
            'width' => 22,
            'origin' => -126,
            'panels' => array('FM84L', 'FM84C-D72C', 'FM84R')
        ),
        'FM26' =>array(
            'width' => 26,
            'origin' => -150,
            'panels' => array('FM12L', 'FM84C', 'FM12C', 'FM84C-D72C', 'FM12C', 'FM84C', 'FM12R')
        ),
        'FM30' =>array(
            'width' => 30,
            'origin' => -174,
            'panels' => array('FM06L', 'FM84C', 'FM84C-D72C', 'FM84C', 'FM84C', 'FM06R')
        ),
        'FM34' =>array(
            'width' => 34,
            'origin' => -198,
            'panels' => array('FM72L', 'FM84C', 'FM84C-D72C', 'FM84C', 'FM72R')
        ),
        'FM38' =>array(
            'width' => 38,
            'origin' => -222,
            'panels' => array('FM12L', 'FM84C', 'FM84C', 'FM84C-D72C', 'FM84C', 'FM84C', 'FM12R')
        ),
        'BT20x22' =>array(
            'width' => 22,
            'origin' => 126,
            'panels' => array('BT20L-06', 'BT20C-96', 'BT20C-48', 'BT20C-96', 'BT20R-06')
        ),
        'BT20x26' =>array(
            'width' => 26,
            'origin' => 150,
            'panels' => array('BT20L-06', 'BT20C-96', 'BT20C-96', 'BT20C-96', 'BT20R-06')
        ),
        'BT20x30' =>array(
            'width' => 30,
            'origin' => 174,
            'panels' => array('BT20L-06', 'BT20C-48', 'BT20C-96', 'BT20C-48', 'BT20C-96', 'BT20C-48', 'BT20R-06')
        ),
        'BT20x34' =>array(
            'width' => 34,
            'origin' => 198,                
            'panels' => array('BT20L-06', 'BT20C-48', 'BT20C-96', 'BT20C-48', 'BT20C-48', 'BT20C-96', 'BT20C-48', 'BT20R-06')
        ),
        'BT20x38' =>array(
            'width' => 38,
            'origin' => 222,
            'panels' => array('BT20L-06', 'BT20C-48', 'BT20C-96', 'BT20C-48', 'BT20C-48', 'BT20C-48', 'BT20C-96', 'BT20C-48', 'BT20R-06')
        ),
        'BT20x42' =>array(
            'width' => 42,
            'origin' => 246,
            'panels' => array('BT20L-06', 'BT20C-48', 'BT20C-96', 'BT20C-48', 'BT20C-96','BT20C-48', 'BT20C-96', 'BT20C-48', 'BT20R-06')
        ),
        'BT20x46' =>array(
            'width' => 46,
            'origin' => 270,
            'panels' => array('BT20L-06', 'BT20C-96', 'BT20C-48', 'BT20C-96', 'BT20C-48','BT20C-96', 'BT20C-48', 'BT20C-96', 'BT20R-06')
        ),
        'BT20x50' =>array(
            'width' => 50,
            'origin' => 294,
            'panels' => array('BT20L-06', 'BT20C-96', 'BT20C-96', 'BT20C-96', 'BT20C-96', 'BT20C-96', 'BT20C-96', 'BT20R-06')
        ),            
        'BT16x18' =>array(
            'width' => 18,
            'origin' => 102,
            'panels' => array('BT16L-06', 'BT16C-48', 'BT16C-96', 'BT16C-48', 'BT16R-06')
        ),
        'BT16x22' =>array(
            'width' => 22,
            'origin' => 126,
            'panels' => array('BT16L-06', 'BT16C-96', 'BT16C-48', 'BT16C-96', 'BT16R-06')
        ),
        'BT16x26' =>array(
            'width' => 26,
            'origin' => 150,
            'panels' => array('BT16L-06', 'BT16C-96', 'BT16C-96', 'BT16C-96', 'BT16R-06')
        ),
        'BT16x30' =>array(
            'width' => 30,
            'origin' => 174,
            'panels' => array('BT16L-06', 'BT16C-48', 'BT16C-96', 'BT16C-48', 'BT16C-96','BT16C-48', 'BT16R-06')
        ),
        'BT16x34' =>array(
            'width' => 34,
            'origin' => 198,
            'panels' => array('BT16L-06', 'BT16C-48', 'BT16C-96', 'BT16C-48', 'BT16C-48', 'BT16C-96', 'BT16C-48', 'BT16R-06')
        ),
        'BT16x38' =>array(
            'width' => 38,
            'origin' => 222,
            'panels' => array('BT16L-06','BT16C-48', 'BT16C-96', 'BT16C-48', 'BT16C-48','BT16C-48','BT16C-96','BT16C-48', 'BT16R-06')
        ),
        'BT16x42' =>array(
            'width' => 42,
            'origin' => 246,
            'panels' => array('BT16L-06', 'BT16C-48', 'BT16C-96', 'BT16C-48', 'BT16C-96', 'BT16C-48', 'BT16C-96', 'BT16C-48', 'BT16R-06')
        ),
        'BT12x18' =>array(
            'width' => 18,
            'origin' => 102,
            'panels' => array('BT12L-06', 'BT12C-48', 'BT12C-96', 'BT12C-48', 'BT12R-06')
        ),
        'BT12x22' =>array(
            'width' => 22,
            'origin' => 126,
            'panels' => array('BT12L-06', 'BT12C-96', 'BT12C-48', 'BT12C-96', 'BT12R-06')
        ),
        'BT12x26' =>array(
            'width' => 26,
            'origin' => 150,
            'panels' => array('BT12L-06', 'BT12C-96', 'BT12C-96', 'BT12C-96', 'BT12R-06')
        ),
        'BT12x30' =>array(
            'width' => 30,
            'origin' => 174,
            'panels' => array('BT12L-06', 'BT12C-48', 'BT12C-96', 'BT12C-48', 'BT12C-96', 'BT12C-48', 'BT12R-06')
        ),
        'BT12x34' =>array(
            'width' => 34,
            'origin' => 198,
            'panels' => array('BT12L-06', 'BT12C-48', 'BT12C-96', 'BT12C-48', 'BT12C-48', 'BT12C-96', 'BT12C-48','BT12R-06')
        ),
        'RT14' => array(
            'width' => 14,
            'origin' => 83.5,
            'panels' => array('RT2L', 'RT1C', 'RT3R')
        ),
        'RT16' => array(
            'width' => 16,
            'origin' => 95.5,
            'panels' => array('RT2L', 'RT1C', 'RT4R')
        ),
        'RT18' => array(
            'width' => 18,
            'origin' => 107.5,
            'panels' => array('RT5L', 'RT1C', 'RT4R')
        ),
        'RT20' => array(
            'width' => 20,
            'origin' => 119.5,
            'panels' => array('RT5L', 'RT1C', 'RT3C', 'RT6R')
        ),
        'LT14' => array(
            'width' => 14,
            'origin' => -83.5,
            'panels' => array('LT3L', 'LT1C', 'LT2R')
        ),
        'LT16' => array(
            'width' => 16,
            'origin' => -95.5,
            'panels' => array('LT4L', 'LT1C', 'LT2R')
        ),
        'LT18' => array(
            'width' => 18,
            'origin' => -107.5,
            'panels' => array('LT4L', 'LT1C', 'LT5R')
        ),
        'LT20' => array(
            'width' => 20,
            'origin' => -119.5,
            'panels' => array('LT6L', 'LT3C', 'LT1C', 'LT5R')
        )
    );
    $panels = array();

    $front = array();
    $origin = $elevations[$front_el]['origin'];
    $panel_idx = 1;
    $front_z = ($depth*12)/2;
    foreach($elevations[$front_el]['panels'] as $panel) {
      $panel_arr = explode('-', $panel);        
      $inches = $inch_map[$panel_arr[0]];
      $front[] = array(
          'slot' => 'f' . $panel_idx,
          'model' => $panel,                
          'width'=>$inches,
          'x' => $origin,
          'y' => -9,
          'z' => $front_z
      );          
      $origin = $origin + $inches;

      $myLastElement = array_slice($panel_arr, -1)[0];
      if(in_array($myLastElement, array('D72C', 'W2L', 'W2R', '72C'))) {
          $panel = $panel_arr[0];
      }

      if($panel == 'FL72R' || $panel == 'FL72L') {
        $panels['f' . $panel_idx] = array(
          $panel . '-W2R',        
          $panel . '-W2L',
          $panel . '-36C',
          $panel . '-42C',          
          $panel
          );
      } else {
        $panels['f' . $panel_idx] = array(
          $panel . '-W2R',
          $panel . '-D72C',
          $panel . '-W2L',
          $panel . '-36C',
          $panel . '-42C',
          $panel . '-72C',
          $panel
          );
      }
      $panel_idx++;            
    }


    $back = array();
    $origin = $elevations[$back_el]['origin'];
    $panel_idx = 1;
    $back_z = -(($depth*12)/2);
    foreach($elevations[$back_el]['panels'] as $panel) {
      $panel_arr = explode('-', $panel);

      $inches = $inch_map[$panel_arr[0].'-'.$panel_arr[1]];

      $back[] = array(
          'slot' => 'b' . $panel_idx,
          'model' => $panel,
          'width'=>$inches,
          'x' => $origin,
          'y' => -9,
          'z' => $back_z
      );
      $origin = $origin - $inches;
      //if(!in_array($panel, array('BT16L-06', 'BT16R-06', 'BT16C-96', 'BT20C-96'))) {
      if($panel == 'BT12C-48' || $panel == 'BT16C-48' || $panel == 'BT20C-48') {
        $panels['b' . $panel_idx] = array(
            $panel . '-18C',
            $panel . '-36C',
            $panel . '-42C',
            $panel . '-D36C',
            $panel
        );
      } elseif($panel == 'BT12C-96' || $panel == 'BT16C-96' || $panel == 'BT20C-96') {
        $panels['b' . $panel_idx] = array(            
            $panel . '-D72C',
            $panel
        );
      } else {
          $panels['b' . $panel_idx] = array($panel);
      }
      $panel_idx++;
    }


    $right = array();
    $origin = $elevations[$right_el]['origin'];
    $panel_idx = 1;
    $right_x = ($length*12)/2;
    $right_x = $right_x - 0.5;
    foreach($elevations[$right_el]['panels'] as $panel) {
      $panel_arr = explode('-', $panel);
      $inches = $inch_map[$panel_arr[0]];
      
      $right[] = array(
          'slot' => 'r' . $panel_idx,
          'model' => $panel,                
          'width'=>$inches,
          'x' => $right_x,
          'y' => -9,
          'z' => $origin
      );      
            
      if($panel == 'RT1C') {
        $panels['r' . $panel_idx] = array(
            $panel . '-18L',
            $panel . '-18C',
            $panel . '-18R',
            $panel . '-36L',
            $panel . '-36C',
            $panel . '-36R',
            $panel            
        );
      } elseif($panel == 'RT2L') {
        $panels['r' . $panel_idx] = array(
            $panel . '-W2L',            
            $panel            
        );
      } elseif($panel == 'RT5L') {
        $panels['r' . $panel_idx] = array(
            $panel . '-D36L',
            $panel . '-W2L',
            $panel            
        );
      } else {
          $panels['r' . $panel_idx] = array($panel);
      }

      $origin = $origin - $inches;
      $panel_idx++;
    }

    $left = array();
    $origin = $elevations[$left_el]['origin'];
    $panel_idx = 1;
    $left_x = -(($length*12)/2);
    $left_x = $left_x + 0.5;
    foreach($elevations[$left_el]['panels'] as $panel) {
      $panel_arr = explode('-', $panel);
      $inches = $inch_map[$panel_arr[0]];
      
      $left[] = array(
          'slot' => 'l' . $panel_idx,
          'model' => $panel,
          'width'=>$inches,
          'x' => $left_x,
          'y' => -9,
          'z' => $origin
      );
      
      
      //if(!in_array($panel, array('LT2R','LT3C','LT4L','LT5R','LT6L','LT7R'))) {
      if($panel == 'LT1C') {
        $panels['l' . $panel_idx] = array(
            $panel . '-18L',
            $panel . '-18C',
            $panel . '-18R',
            $panel . '-36L',
            $panel . '-36C',
            $panel . '-36R',
            $panel
        );
      } elseif($panel == 'LT2R') {
        $panels['l' . $panel_idx] = array(
            $panel . '-W2R',
            $panel
        );
      } elseif($panel == 'LT5R') {
        $panels['l' . $panel_idx] = array(
            $panel . '-D36R',
            $panel . '-W2R',
            $panel
        );
      } else {
        $panels['l' . $panel_idx] = array($panel);
      }

      $origin = $origin + $inches;
      $panel_idx++;
    }

    $sizecode = $depth . 'x' . $length;

    $roof_offset = 0;
    if($depth == 14 || $depth == 16) {
        $roof_offset = -2.8;
    }

    $data = array(
      'model' => 'summit',
      'size' => $sizecode,
      'depth' => (int)$depth,
      'length' => (int)$length,
      'name' => 'summit ' . $sizecode,
      'shell_base_price' => $shell_base_price[$sizecode],
      'roof' => array(
          'model' => $sizecode . '-STV',
          'x' => 0,
          'y' => (-9 + $roof_offset),
          'z' => 0
      ),
      'floor' => array(
          'width' => $length*12,
          'height' => 12,
          'depth' => $depth*12,
          'x' => ($length*12)/2,
          'y' => -9,
          'z' => ($depth*12)/2                
      ),
      'name' => $sizecode . ' summit',    
      'front' => $front,
      'back' => $back,
      'left' => $left,
      'right' => $right,
      'panels' => $panels
    );
    
    return $data;
}


/******
 * CURATED SG PANEL MAP
  */
function curated_signature_panel_map($model) {
    $length = 12;
    $depth = 10;
    $shell_base_price = array(      
      '10x12' => 14606
    );

    $curated_panels = array(
        'solitude' => array(
            'front' => 'F12-W2L-D72C-W2R',
            'back' => 'B10x12',
            'left' => 'L10-36C',
            'right' => 'R10-36C'
        )
    );

    $front_el = 'F'. (string)$length;
    $back_el = 'B' . (string)$depth . 'x' . (string)$length;
    $right_el = 'R' . (string)$depth;
    $left_el = 'L' . (string)$depth;

    $elevations = array(
        'F12' => array(
            'width' => 12,
            'origin' => -68,
            'panel' => $curated_panels[$model]['front']
        ),      
        'B10x12' => array(
            'width' => 12,
            'origin' => -68,
            'panel' => $curated_panels[$model]['back']
        ),
        'R10' => array(
            'width' => 10,
            'origin' => 60,
            'panel' => $curated_panels[$model]['right']
        ),
        'L10' => array(
            'width' => 10,
            'origin' => -60,
            'panel' => $curated_panels[$model]['left']
        )
    );
    $panels = array();
    $front = array();
    $origin = $elevations[$front_el]['origin'];
    $panel_idx = 1;
    $front_z = ($depth*12)/2;
    $inches = $elevations[$front_el]['width']*12;
    $front[] = array(
      'slot' => 'f1',
      'model' => $elevations[$front_el]['panel'],                
      'width'=> $inches,
      'x' => $origin,
      'y' => -9,
      'z' => $front_z
    );



    $back = array();
    $origin = $elevations[$back_el]['origin'];
    $panel_idx = 1;
    $back_z = -(($depth*12)/2);
    $inches = $elevations[$back_el]['width']*12;
    $back[] = array(
      'slot' => 'b1',
      'model' => $elevations[$back_el]['panel'],
      'width'=> $inches,
      'x' => $origin,
      'y' => -9,
      'z' => $back_z
    );    


    $right = array();
    $origin = $elevations[$right_el]['origin'];
    $panel_idx = 1;
    $right_x = ($length*12)/2;
    $right_x = $right_x - 1;
    $inches = $elevations[$right_el]['width']*12;
    $right[] = array(
      'slot' => 'r1',
      'model' => $elevations[$right_el]['panel'],
      'width'=> $inches,
      'x' => $right_x,
      'y' => -9,
      'z' => $origin
    );    

    $left = array();
    $origin = $elevations[$left_el]['origin'];
    $panel_idx = 1;
    $left_x = -(($length*12)/2);
    $left_x = $left_x + 1;
    $inches = $elevations[$left_el]['width']*12;
    $left[] = array(
      'slot' => 'l1',
      'model' => $elevations[$left_el]['panel'],
      'width'=> $inches,
      'x' => $left_x,
      'y' => -9,
      'z' => $origin
    );


 
    $roof_offset = 0;

    $sizecode = $depth . 'x' . $length;

    $data = array(
      'curated' => true,
      'model' => 'signature',
      'size' => $sizecode,
      'depth' => (int)$depth,
      'length' => (int)$length,
      'name' => 'signature ' . $sizecode,
      'shell_base_price' => $shell_base_price[$sizecode],
      'roof' => array(
          'model' => 'SG-' . $sizecode . '-STE-06F',
          'x' => 0,
          'y' => (-9 + $roof_offset),
          'z' => 8
      ),
      'floor' => array(
          'width' => $length*12,
          'height' => 12,
          'depth' => $depth*12,
          'x' => ($length*12)/2,
          'y' => -9,
          'z' => ($depth*12)/2                
      ),
      'name' => $sizecode . ' signature',    
      'front' => $front,
      'back' => $back,
      'left' => $left,
      'right' => $right,
      'panels' => $panels
    );
    return $data; 

 }



/******
 * SIGNATURE PANEL MAP
 * @depth = 10
 * @length = 12
 */
function signature_panel_map($depth, $length) {

    if($depth == 8) {
        $depth = '08';
    }

    $shell_base_price = array(
      '08x12' => 13861,
      '08x16' => 15693,
      '10x12' => 14606,
      '10x16' => 16515,
      '10x20' => 18424,
      '12x12' => 18795,
      '12x16' => 20308,
      '12x20' => 21819
    );

    $front_el = 'F'. (string)$length;
    $back_el = 'B' . (string)$depth . 'x' . (string)$length;
    $right_el = 'R' . (string)$depth;
    $left_el = 'L' . (string)$depth;

    $elevations = array(
        'F12' => array(
            'width' => 12,
            'origin' => -68,
            'panel' => 'F12-D72C'
        ),
        'F16' => array(
            'width' => 16,
            'origin' => -92,
            'panel' => 'F16-D72C'
        ),
        'F20' => array(
            'width' => 20,
            'origin' => -116,
            'panel' => 'F20-D72C'
        ),
        'B08x12' => array(
            'width' => 12,
            'origin' => -68,
            'panel' => 'B08x12'
        ),
        'B08x16' => array(
            'width' => 16,
            'origin' => -92,
            'panel' => 'B08x16'
        ),        
        'B10x12' => array(
            'width' => 12,
            'origin' => -68,
            'panel' => 'B10x12'
        ),
        'B10x16' => array(
            'width' => 16,
            'origin' => -92,
            'panel' => 'B10x16'
        ),
        'B10x20' => array(
            'width' => 20,
            'origin' => -116,
            'panel' => 'B10x20'
        ),
        'B12x12' => array(
            'width' => 12,
            'origin' => -68,
            'panel' => 'B12x12'
        ),
        'B12x16' => array(
            'width' => 16,
            'origin' => -92,
            'panel' => 'B12x16'
        ),
        'B12x20' => array(
            'width' => 20,
            'origin' => -116,
            'panel' => 'B12x20'
        ),
        'R08' => array(
            'width' => 8,
            'origin' => 48,
            'panel' => 'R08'
        ),
        'R10' => array(
            'width' => 10,
            'origin' => 60,
            'panel' => 'R10'
        ),
        'R12' => array(
            'width' => 12,
            'origin' => 72,
            'panel' => 'R12'
        ),
        'L08' => array(
            'width' => 8,
            'origin' => -48,
            'panel' => 'L08'
        ),
        'L10' => array(
            'width' => 10,
            'origin' => -60,
            'panel' => 'L10'
        ),
        'L12' => array(
            'width' => 12,
            'origin' => -72,
            'panel' => 'L12'
        )

    );
    $panels = array();
    $front = array();
    $origin = $elevations[$front_el]['origin'];
    $panel_idx = 1;
    $front_z = ($depth*12)/2;
    $inches = $elevations[$front_el]['width']*12;
    $front[] = array(
      'slot' => 'f1',
      'model' => $elevations[$front_el]['panel'],                
      'width'=> $inches,
      'x' => $origin,
      'y' => -9,
      'z' => $front_z
    );
    $panels['f1'] = array(
        $front_el . '-W2L-D36CL',
        $front_el . '-D36CR-W2R',
        $front_el . '-D36L',
        $front_el . '-D36R',
        $front_el . '-D72C',
        $front_el . '-W2L-D72C-W2R'
    );


    $back = array();
    $origin = $elevations[$back_el]['origin'];
    $panel_idx = 1;
    $back_z = -(($depth*12)/2);
    $inches = $elevations[$back_el]['width']*12;
    $back[] = array(
      'slot' => 'b1',
      'model' => $elevations[$back_el]['panel'],
      'width'=> $inches,
      'x' => $origin,
      'y' => -9,
      'z' => $back_z
    );    
    $panels['b1'] = array(
        $back_el,
        $back_el . '-18L-18R'
    );
    

    $right = array();
    $origin = $elevations[$right_el]['origin'];
    $panel_idx = 1;
    $right_x = ($length*12)/2;
    $right_x = $right_x - 1;
    $inches = $elevations[$right_el]['width']*12;
    $right[] = array(
      'slot' => 'r1',
      'model' => $elevations[$right_el]['panel'],
      'width'=> $inches,
      'x' => $right_x,
      'y' => -9,
      'z' => $origin
    );    
    $panels['r1'] = array(
        $right_el,
        $right_el . '-W2L'
    );
    if($depth == 10 || $depth == 12) {
        $panels['r1'][] = $right_el . '-18C';
        $panels['r1'][] = $right_el . '-36C';
        $panels['r1'][] = $right_el . '-W2L-18C';
        $panels['r1'][] = $right_el . '-W2L-36C';
    }


    $left = array();
    $origin = $elevations[$left_el]['origin'];
    $panel_idx = 1;
    $left_x = -(($length*12)/2);
    $left_x = $left_x + 1;
    $inches = $elevations[$left_el]['width']*12;
    $left[] = array(
      'slot' => 'l1',
      'model' => $elevations[$left_el]['panel'],
      'width'=> $inches,
      'x' => $left_x,
      'y' => -9,
      'z' => $origin
    );



    $panels['l1'] = array(
        $left_el,
        $left_el . '-W2R'
    );
    if($depth == 10 || $depth == 12) {
        $panels['l1'][] = $left_el . '-18C';
        $panels['l1'][] = $left_el . '-36C';
        $panels['l1'][] = $left_el . '-18C-W2R';
        $panels['l1'][] = $left_el . '-36C-W2R';
    }
    
    $roof_offset = 0;

    $sizecode = $depth . 'x' . $length;

    $data = array(
      'model' => 'signature',
      'size' => $sizecode,
      'depth' => (int)$depth,
      'length' => (int)$length,
      'name' => 'signature ' . $sizecode,
      'shell_base_price' => $shell_base_price[$sizecode],
      'roof' => array(
          'model' => 'SG-' . $sizecode . '-STE-06F',
          'x' => 0,
          'y' => (-9 + $roof_offset),
          'z' => 8
      ),
      'floor' => array(
          'width' => $length*12,
          'height' => 12,
          'depth' => $depth*12,
          'x' => ($length*12)/2,
          'y' => -9,
          'z' => ($depth*12)/2                
      ),
      'name' => $sizecode . ' signature',    
      'front' => $front,
      'back' => $back,
      'left' => $left,
      'right' => $right,
      'panels' => $panels
    );
    return $data; 
  }

/******
 * PORTLAND PANEL MAP
 * @depth = 10
 * @length = 12
 */
function portland_panel_map($depth, $length) {

    $shell_base_price = array(
      '10x12' => 19520,
      '10x16' => 22071,      
      '12x12' => 25121,
      '12x16' => 27140,
      '16x16' => 34793
    );

    if($length == 12) {
        $front_el = 'PF12';
    }
    if($length == 16) {
        $front_el = 'PF16';
    }

    $back_el = 'PB' . (string)$length;
    $right_el = 'PR' . (string)$depth;
    $left_el = 'PL' . (string)$depth;

    $elevations = array(
        'PF12' => array(
            'width' => 12,
            'origin' => -72,
            'panel' => 'PF12-4-W3-D72C'
        ),
        'PF16' => array(
            'width' => 16,
            'origin' => -96,
            'panel' => 'PF16-4-W3-D72C'
        ),
        'PB12' => array(
            'width' => 12,
            'origin' => 72,
            'panel' => 'PB12'
        ),
        'PB16' => array(
            'width' => 16,
            'origin' => 96,
            'panel' => 'PB16'
        ),
        'PR10' => array(
            'width' => 10,
            'origin' => 54.5,
            'panel' => 'PR10'
        ),
        'PR12' => array(
            'width' => 12,
            'origin' => 66.5,
            'panel' => 'PR12'
        ),
        'PR16' => array(
            'width' => 16,
            'origin' => 90.5,
            'panel' => 'PR16-36C'
        ),
        'PL10' => array(
            'width' => 10,
            'origin' => -54.5,
            'panel' => 'PL10'
        ),
        'PL12' => array(
            'width' => 12,
            'origin' => -66.5,
            'panel' => 'PL12'
        ),
        'PL16' => array(
            'width' => 12,
            'origin' => -90.5,
            'panel' => 'PL16-36C'
        )

    );
    $panels = array();
    $front = array();
    $origin = $elevations[$front_el]['origin'];
    $panel_idx = 1;
    $front_z = ($depth*12)/2;
    $inches = $elevations[$front_el]['width']*12;
    $front[] = array(
      'slot' => 'f1',
      'model' => $elevations[$front_el]['panel'],                
      'width'=> $inches,
      'x' => $origin,
      'y' => -9,
      'z' => $front_z-1
    );
    $panels['f1'] = array(
        $front_el . '-4-W3-D72C',
        $front_el . '-4-W3'
    );


    $back = array();
    $origin = $elevations[$back_el]['origin'];
    $panel_idx = 1;
    $back_z = -(($depth*12)/2);
    $inches = $elevations[$back_el]['width']*12;
    $back[] = array(
      'slot' => 'b1',
      'model' => $elevations[$back_el]['panel'],
      'width'=> $inches,
      'x' => $origin,
      'y' => -9,
      'z' => $back_z+1
    );    
    $panels['b1'] = array(
        $back_el,
        $back_el . '-2-W3'
    );
    

    $right = array();
    $origin = $elevations[$right_el]['origin'];
    $panel_idx = 1;
    $right_x = ($length*12)/2;
    $right_x = $right_x - 0.5;
    $inches = $elevations[$right_el]['width']*12;
    $right[] = array(
      'slot' => 'r1',
      'model' => $elevations[$right_el]['panel'],
      'width'=> $inches,
      'x' => $right_x,
      'y' => -9,
      'z' => $origin
    );    
    $panels['r1'] = array(
        $right_el,
        $right_el . '-36C'
    );
    /*
    if($depth == 10 || $depth == 12) {
        $panels['r1'][] = $right_el . '-18C';
        $panels['r1'][] = $right_el . '-36C';
        $panels['r1'][] = $right_el . '-W2L-18C';
        $panels['r1'][] = $right_el . '-W2L-36C';
    }
    */


    $left = array();
    $origin = $elevations[$left_el]['origin'];
    $panel_idx = 1;
    $left_x = -(($length*12)/2);
    $left_x = $left_x + 0.5;
    $inches = $elevations[$left_el]['width']*12;
    $left[] = array(
      'slot' => 'l1',
      'model' => $elevations[$left_el]['panel'],
      'width'=> $inches,
      'x' => $left_x,
      'y' => -9,
      'z' => $origin
    );



    $panels['l1'] = array(
        $left_el,
        $left_el . '-36C'
    );
    /*
    if($depth == 10 || $depth == 12) {
        $panels['l1'][] = $left_el . '-18C';
        $panels['l1'][] = $left_el . '-36C';
        $panels['l1'][] = $left_el . '-18C-W2R';
        $panels['l1'][] = $left_el . '-36C-W2R';
    }
    */

    $roof_offset = 0;

    $sizecode = $depth . 'x' . $length;

    $data = array(
      'model' => 'portland',
      'size' => $sizecode,
      'depth' => (int)$depth,
      'length' => (int)$length,
      'name' => 'portland ' . $sizecode,
      'shell_base_price' => $shell_base_price[$sizecode],
      'roof' => array(
          'model' => 'PT-' . $sizecode . '-STV',
          'x' => 0,
          'y' => (-9 + $roof_offset),
          'z' => 0
      ),
      'floor' => array(
          'width' => $length*12,
          'height' => 12,
          'depth' => $depth*12,
          'x' => ($length*12)/2,
          'y' => -9,
          'z' => ($depth*12)/2                
      ),
      'name' => $sizecode . ' portland',    
      'front' => $front,
      'back' => $back,
      'left' => $left,
      'right' => $right,
      'panels' => $panels
    );  

    return $data; 
}
